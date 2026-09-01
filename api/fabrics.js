// This runs on Vercel's servers, never in the visitor's browser — so your
// Airtable token stays private. The page at /index.html calls this at
// /api/fabrics and never talks to Airtable directly.
//
// It expects three environment variables, set in the Vercel dashboard
// under Project Settings -> Environment Variables (see README.md):
//   AIRTABLE_TOKEN     - a Personal Access Token scoped to your base, read-only
//   AIRTABLE_BASE_ID   - starts with "app..."
//   AIRTABLE_TABLE     - optional, defaults to "Fabrics"

module.exports = async function handler(req, res) {
  try {
    var token = process.env.AIRTABLE_TOKEN;
    var baseId = process.env.AIRTABLE_BASE_ID;
    var table = process.env.AIRTABLE_TABLE || "Fabrics";

    if (!token || !baseId) {
      res.status(500).json({
        error: "Server is missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID environment variables. Add them in Vercel -> Project Settings -> Environment Variables, then redeploy."
      });
      return;
    }

    var records = [];
    var offset;

    do {
      var url = "https://api.airtable.com/v0/" + baseId + "/" + encodeURIComponent(table) +
        "?pageSize=100" + (offset ? "&offset=" + encodeURIComponent(offset) : "");

      var resp = await fetch(url, {
        headers: { Authorization: "Bearer " + token }
      });

      if (!resp.ok) {
        var errText = await resp.text();
        res.status(resp.status).json({ error: "Airtable request failed", detail: errText });
        return;
      }

      var data = await resp.json();
      records = records.concat(data.records || []);
      offset = data.offset;
    } while (offset);

    function grade(v) {
      return (v && v !== "Not tested") ? String(v) : null;
    }
    function num(v) {
      return (typeof v === "number") ? v : null;
    }
    function text(v) {
      return (v === undefined || v === null) ? "" : String(v);
    }

    var fabrics = records.map(function (r) {
      var f = r.fields || {};
      var photoField = f["Photo"];
      var photoUrl = (Array.isArray(photoField) && photoField[0] && photoField[0].url) ? photoField[0].url : null;

      return {
        id: f["Fabric Code"] || r.id,
        category: f["Category"] || "",
        composition: text(f["Composition"]),
        gsm: num(f["GSM"]),
        width: num(f["Width"]),
        shrinkage: text(f["Shrinkage"]),
        pilling: grade(f["Pilling Grade"]),
        colorFastness: grade(f["Color Fastness"]),
        moq: text(f["MOQ"]),
        status: f["Status"] || "In-Stock",
        photoUrl: photoUrl
      };
    });

    // Short cache: keeps Airtable calls low while still refreshing often
    // enough that photo links (which Airtable periodically rotates) stay
    // fresh for visitors.
    res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=600");
    res.status(200).json({ fabrics: fabrics });
  } catch (err) {
    res.status(500).json({ error: "Unexpected server error", detail: String((err && err.message) || err) });
  }
};

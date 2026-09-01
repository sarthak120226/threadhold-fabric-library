# Threadhold Fabric Library — deployment guide

This folder is the whole website: `index.html` is the page your buyers see,
`api/fabrics.js` is the one small piece of server code that fetches your
inventory from Airtable and hands it to the page. No other files are needed.

You do **not** need to know how to code to deploy this. Follow the steps in
order. Nothing here costs money at the scale you're starting at.

## 1. Get your Airtable credentials

You should already have an Airtable base called "Threadhold Fabric Library"
with a table called "Fabrics" (see the earlier setup steps). Note: the site
doesn't use a Certifications field — if you added one, feel free to leave it
or delete it, it just won't be read. Now:

1. Go to **airtable.com/create/tokens**.
2. Click **Create new token**. Name it "Fabric library website".
3. Under **Scopes**, add `data.records:read` only — the website only ever
   needs to read, never write.
4. Under **Access**, add the specific base "Threadhold Fabric Library".
5. Click **Create token** and copy it immediately (you won't be able to see
   it again). This is your `AIRTABLE_TOKEN`.
6. Open your base in a browser and look at the URL: it looks like
   `airtable.com/appXXXXXXXXXXXXXX/...`. The `appXXXXXXXXXXXXXX` part is
   your `AIRTABLE_BASE_ID`.

Keep both values somewhere safe for step 3 — never put them directly into
any file in this folder or commit them anywhere public.

## 2. Put this folder on GitHub

1. Create a free account at **github.com** if you don't have one.
2. Click **New repository**. Name it `threadhold-fabric-library`. Keep it
   Private or Public, either works.
3. On the new repo's page, click **uploading an existing file**, then drag
   in every file from this folder (`index.html`, the `api` folder with
   `fabrics.js` inside it, `.env.example`, this `README.md`). Commit.

No command line needed — this is all drag-and-drop in the browser.

## 3. Deploy to Vercel

1. Create a free account at **vercel.com** — sign up with GitHub, it's the
   fastest option and connects the two automatically.
2. Click **Add New -> Project**, and pick the `threadhold-fabric-library`
   repo you just created.
3. Before clicking Deploy, open **Environment Variables** and add:
   - `AIRTABLE_TOKEN` = the token from step 1
   - `AIRTABLE_BASE_ID` = the base ID from step 1
   - `AIRTABLE_TABLE` = `Fabrics`
4. Click **Deploy**. In about a minute you'll get a working link like
   `threadhold-fabric-library.vercel.app` — open it and confirm your
   fabrics show up.

If the page loads but shows "Couldn't load the live catalog," double-check
the three environment variable values, then go to the project's
**Deployments** tab and redeploy.

## 4. Connect your domain

1. In the Vercel project, go to **Settings -> Domains** and enter the
   subdomain you want, e.g. `samples.threadhold.co`. Vercel will show you a
   CNAME record to add.
2. Go to wherever threadhold.co's DNS is managed (your domain registrar, or
   Google Workspace's admin console if it's managed there) and add that
   CNAME record: host `samples`, pointing to the value Vercel showed you.
3. Wait a few minutes to an hour for it to go live. Vercel adds HTTPS
   automatically once it detects the record.

Your main site at threadhold.co is untouched by this — a subdomain is a
separate, independent record.

## 5. Day-to-day updates

Open Airtable (web or the phone app), add or edit a row, drag in a photo,
save. The site picks it up automatically within a few minutes — nothing
else to do, no redeploying, no code.

## If something needs to change later

Adding a new fabric, fixing a typo, changing stock status — all of that is
just editing Airtable, forever, on your own. If you ever want the *site
itself* to do something new (a new filter, a new page, a different look),
come back and I'll make the change to these files and you redeploy the same
way (or just push the update to the same GitHub repo and Vercel updates the
live site automatically).

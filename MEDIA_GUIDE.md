# ARKADHATRI — Replacing Sample Photos with Studio Photos & Videos

Everything you save in the Admin panel shows on the shop straight away. You don't need a developer or a redeploy.

## 1. Prepare the photos
- Shoot 4 to 6 photos per saree: full drape, pallu, border close-up, zari or texture detail, blouse piece, and the folded saree.
- Use a portrait 4:5 frame, at least 1600 × 2000 px, exported as **JPG or WebP under 500 KB**.
- Name the files clearly, for example `kavya-01-drape.jpg`.

## 2. Put them online (you get a direct link for each file)
The shop shows photos from a link, so upload each photo to any image host that gives a **direct** link. A direct link ends in `.jpg`, `.png` or `.webp`, or opens only the image. For example:
- Cloudinary (free tier): Upload, then "Copy URL"
- ImageKit, Bunny CDN, Amazon S3 or Cloudflare R2
- Your own hosting at `https://arkadhatri.com/images/...`

Google Drive and Instagram links do **not** work, because they open a web page, not the image.

## 3. Replace the photos in Admin
1. Go to `/admin` and sign in.
2. Open **Products** and click the saree.
3. In **Images**, paste a link into "Paste image URL" and click **Add**. Repeat for each photo.
4. Use ↑ / ↓ to move the best photo to the top. The first photo is the cover on every listing.
5. Click ✕ on each old sample photo.
6. Click **Save Changes**.

While the cover is still a sample stock photo, the shop shows a "STUDIO PHOTO PENDING" tag. The tag disappears as soon as the cover is one of your own photos. The editor warns you if any sample photos are still there.

## 4. Add a video (optional)
1. Upload an **MP4** (H.264, 1080p, 10–30 seconds, under 15 MB) to the same host.
2. In the saree's **Video** section, paste the video link, plus a poster image link (the frame shown before it plays).
3. Save. The product page then shows a "See the saree in motion" section.

## 5. Care & Draping guide (per saree)
- With the care tips left empty, the shop shows the ready-made guide for the saree's **Fabric Type** (Kanjivaram, Mysore, Pure Silk, Cotton).
- To write your own, click "Copy the ready-made tips here", edit them (one tip per line) and save.
- **Draping note**: an optional tip for this saree, shown under the 6 draping steps.

## 6. Homepage banner and collection images
The large homepage hero, collection tiles and Instagram strip are part of the site design. They are not in Admin yet. Send the photos with a note saying where each one goes, and they can be replaced in `app/page.js` (the `IMG` block at the top).

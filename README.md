# Onward (beta)

A mobile web app for adults who are newly disabled — especially wheelchair users — and the people helping them.

- **Find care:** rehab hospitals, SCI Model System centers, physiatrists, spine surgeons, neurologists, pain doctors, urologists, equipment suppliers, psychologists, counselors and more, sorted by distance from a zip code. Live data comes from the national NPI registry via the National Library of Medicine's free Clinical Tables API (no key needed).
- **Resources:** ~150 vetted links, filtered by disability, age, veteran status and where the person is (hospital, rehab, nursing home, home).
- **My plan:** setting-aware next steps with Now/Soon/Later priorities, equipment tracker, care team, medicines, and questions for the doctor. Saved only on the device; backup/restore and print included.
- **Medicine lookup:** plain-language MedlinePlus guides.

## Files
All files sit flat in the repo root. `data.js` holds every resource, step and equipment suggestion — edit it to add or fix links. `zips0–9.json` and `zip3index.json` are offline zip-code locations used to measure distance.

## Publish
Upload everything to a GitHub repo named `onward`, then Settings → Pages → deploy from the main branch. The site will be at https://mightywaters.github.io/onward/
When you change files, bump `VERSION` in `sw.js` so installed copies update.

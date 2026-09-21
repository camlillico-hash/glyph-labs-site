# BOS360 page archive

The previous `/bos360` page is preserved at `/bos360-archive` with `noindex, nofollow` metadata and no navigation or sitemap entry.

Its original implementation remains unchanged in `app/coaching-v2/page.js`, including its shared header and assets. Before the V3 promotion, `/bos360` re-exported this same implementation.

The production `/bos360` route now renders the approved `app/bos360-v3/page.tsx` with indexable metadata. `/bos360-v3` remains available with `noindex, nofollow`.

To restore the previous production page, replace `app/bos360/page.js` with:

```js
export { metadata } from "../coaching-v2/page";
export { default } from "../coaching-v2/page";
```

The last V3-only commit before promotion was `01193f33156a434581aa9317703eb41106cf0247`.

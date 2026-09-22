# BOS360 page archive

The previous `/bos360` page is preserved at `/bos360-archive` with `noindex, nofollow` metadata and no navigation or sitemap entry.

Its original implementation remains unchanged in `app/coaching-v2/page.js`, including its shared header and assets. Before the V3 promotion, `/bos360` re-exported this same implementation.

The approved `app/bos360-v3/page.tsx` is now the homepage at `/`, with indexable metadata and a self-referencing canonical. `/bos360` and `/bos360-v3` permanently redirect to `/`.

To restore the previous coaching page, replace `app/bos360/page.js` with:

```js
export { metadata } from "../coaching-v2/page";
export { default } from "../coaching-v2/page";
```

The last V3-only commit before promotion was `01193f33156a434581aa9317703eb41106cf0247`.

# Direct scent-journal entry

The bottom Explore menu and its page heading are now 책과향기. Existing hashes and five-tab navigation are preserved.

After journal login, customers can select one of the existing 72 numbered main scents and any of the 30 blind notes (T1–T10, M1–M10, L1–L10), then save directly. Notes show codes and character hints until the recipe is saved. Saved customer/admin compositions include both note codes and names. The normal blend page's save-current flow, metadata editing, paging, deletion and journal authentication remain unchanged. A manual journal recipe never overwrites the blend page's selection. No quantities, schema changes, backend changes or metaverse changes.

Run node scripts/verify-journal-picker.mjs after installing archive dependencies (requires Edge). It verifies the real frontend against mocked APIs: selection counts, blind preview, missing-main validation, persisted request IDs, all 30 notes, existing blend save, metadata edits, logout isolation, mobile/desktop widths and translated navigation. Screenshots go to ignored .release/.

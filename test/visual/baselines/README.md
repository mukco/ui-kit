Screenshot baselines for every section of `playground/library.html`, made by
CI (fonts and anti-aliasing differ between machines, so local baselines would
not match CI's). `npm run visual` compares; the **Update visual baselines**
workflow (Actions → run on a branch) rewrites them and commits the result.
A change that is meant to look different updates them on its branch.

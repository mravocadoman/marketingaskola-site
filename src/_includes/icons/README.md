# Card icons

Material Symbols, **Sharp** style, **filled**, weight 400, from the npm package
`@material-symbols/svg-400@0.48.0` (Google, Apache License 2.0, see `LICENSE`).
Sharp because every corner on this site is square; filled because objects on
this site are drawn as solid shapes, never outlines.

Only the icons the pages use are vendored here, one file per icon, named as in
Material Symbols without the `-fill` suffix. Use them through the shortcode:

    <span class="card-icon">{% icon "monitoring" %}</span>

The shortcode inlines the SVG with `fill="currentColor"` and `aria-hidden`, so
the colour comes from CSS. A name with no file here fails the build.

To add one: find it at https://fonts.google.com/icons (Sharp, Fill on), copy
`sharp/<name>-fill.svg` from the same package version into this folder as
`<name>.svg`.

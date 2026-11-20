# widget

Custom **widget** block. Purpose: loads an HTML/CSS/JS widget from /widgets/ for interactive, data-driven features that are not authorable content.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row, one cell: a link to /widgets/<name> (e.g. /widgets/course-finder). Query parameters on the link become data-* config on the widget element (e.g. /widgets/course-finder?base=https://www.unir.net routes the finder to the source site). The block takes the widget name as its class.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

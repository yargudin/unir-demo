# form

Custom **form** block. Purpose: Lead-generation contact form (Solicita información) rendered from authored field rows; no external submission unless an endpoint is authored.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: One row per field: Label (append * for required) | Type (text, email, tel, number, date, textarea, select, radio, checkbox, consent, hidden, heading, info, submit, success, action) | Options (select/radio list) or placeholder | Required (yes). Row type "action" holds the POST endpoint link; "success" holds the thank-you message. Alternatively a single-cell row linking a .json sheet (Name, Label, Type, Options, Mandatory, Placeholder).

## Rendering notes

- Labels float over the controls (`.form-filled` is set on a field wrapper once it has a value).
- An `info` row holding only a list renders as the dark highlights band (`.form-highlights`, Phosphor icons timer / lightning / calendar; the last item is gold).
- A long `info` row (several paragraphs or more than 280 characters) is clamped with a "Ver más" / "Ver menos" toggle (`.form-legal`).
- `tel` fields get a read-only prefix: a leading `+NN` in the options cell, else the `phone-prefix` page metadata, else `+34`.
- A province/state select placed right after a country select (`País`/`Country`) shares its row.
- At 1280px and wider the submit button sticks to the bottom of the scrolling sidebar.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

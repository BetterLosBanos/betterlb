-- Terms data
INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range, mayor, vice_mayor)
VALUES (
  'sb_9',
  9,
  '9th',
  '9th Sangguniang Bayan',
  '2016-07-01',
  '2019-06-30',
  '2016-2019',
  'CAESAR P. PEREZ',
  'PROCOPIO A. ALIPON'
)
ON CONFLICT(id) DO UPDATE SET
  term_number = excluded.term_number,
  ordinal = excluded.ordinal,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  year_range = excluded.year_range,
  mayor = excluded.mayor,
  vice_mayor = excluded.vice_mayor;

INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range, mayor, vice_mayor)
VALUES (
  'sb_10',
  10,
  '10th',
  '10th Sangguniang Bayan',
  '2019-07-01',
  '2022-06-30',
  '2019-2022',
  'CAESAR P. PEREZ',
  'ANTONIO L. KALAW'
)
ON CONFLICT(id) DO UPDATE SET
  term_number = excluded.term_number,
  ordinal = excluded.ordinal,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  year_range = excluded.year_range,
  mayor = excluded.mayor,
  vice_mayor = excluded.vice_mayor;

INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range, mayor, vice_mayor)
VALUES (
  'sb_11',
  11,
  '11th',
  '11th Sangguniang Bayan',
  '2022-07-01',
  '2025-06-30',
  '2022-2025',
  'ANTHONY F. GENUINO',
  'JOSEPHINE S. EVANGELISTA'
)
ON CONFLICT(id) DO UPDATE SET
  term_number = excluded.term_number,
  ordinal = excluded.ordinal,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  year_range = excluded.year_range,
  mayor = excluded.mayor,
  vice_mayor = excluded.vice_mayor;

INSERT INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range, mayor, vice_mayor)
VALUES (
  'sb_12',
  12,
  '12th',
  '12th Sangguniang Bayan',
  '2025-07-01',
  '2028-06-30',
  '2025-2028',
  'NIEL ANDREW N. NOCON',
  'MARLO PJ A. ALIPON'
)
ON CONFLICT(id) DO UPDATE SET
  term_number = excluded.term_number,
  ordinal = excluded.ordinal,
  name = excluded.name,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  year_range = excluded.year_range,
  mayor = excluded.mayor,
  vice_mayor = excluded.vice_mayor;


const escapeCsvValue = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

const convertToCsv = (rows, columns) => {
  const header = columns
    .map((column) => escapeCsvValue(column.label))
    .join(",");

  const data = rows.map((row) =>
    columns
      .map((column) =>
        escapeCsvValue(row[column.key])
      )
      .join(",")
  );

  return [header, ...data].join("\n");
};

module.exports = {
  convertToCsv
};
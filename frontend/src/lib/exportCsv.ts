/**
 * Generic CSV export utility.
 * Converts an array of flat objects to a downloadable CSV file.
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const escape = (val: unknown) => {
        const str = val === null || val === undefined ? "" : String(val);
        // Wrap in quotes if it contains comma, quote, or newline
        return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    };

    const csvContent = [
        headers.join(","),
        ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}
    
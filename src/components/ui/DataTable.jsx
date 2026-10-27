import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  title,
  searchPlaceholder = "Search...",
  actions,
  emptyMessage = "No data found",
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return data;

    return data.filter((row) =>
      Object.values(row).some((value) =>
        String(value)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

      <div className="flex flex-wrap items-center justify-between gap-4 border-b p-6">

        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-500">
            {filtered.length} records
          </p>
        </div>

        <div className="flex gap-3">

          <div className="flex items-center gap-2 rounded-xl border px-4 py-2">

            <Search size={18} />

            <input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="outline-none"
            />

          </div>

          {actions}

        </div>

      </div>

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead>

            <tr className="bg-gray-50">

              {columns.map((column) => (

                <th
                  key={column.key}
                  className="px-6 py-4 text-left text-sm font-semibold"
                >
                  {column.title}
                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {loading && (

              <tr>

                <td
                  colSpan={columns.length}
                  className="py-10 text-center"
                >
                  Loading...
                </td>

              </tr>

            )}

            {!loading &&
              filtered.length === 0 && (

                <tr>

                  <td
                    colSpan={columns.length}
                    className="py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>

                </tr>

              )}

            {!loading &&
              filtered.map((row) => (

                <tr
                  key={row.id}
                  className="border-t hover:bg-gray-50"
                >

                  {columns.map((column) => (

                    <td
                      key={column.key}
                      className="px-6 py-4"
                    >
                      {column.render
                        ? column.render(row)
                        : row[column.key]}
                    </td>

                  ))}

                </tr>

              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
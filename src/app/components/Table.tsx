import { ChevronLeftIcon, ChevronRightIcon, InboxArrowDownIcon } from "@heroicons/react/20/solid";
import moment from "moment";
import Link from "next/link";

type tableProps = {
  columns: any;
  tableData: any;
  metaData: any;
  linkData: any;
  loading: boolean;
  tableFn: (params: object) => void;
};

const Table = ({ columns, tableData, metaData, linkData, loading, tableFn }: tableProps) => {
  const handleChange = (limit: number, page: number) => {
    tableFn({
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
      limit: limit,
      page: page,
    });
  };

  return (
    <>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          <tr>
            {columns.map((columnHeader: any) => (
              <th
                key={columnHeader.index}
                scope="col"
                className={`px-6 max-sm:px-1 py-3 text-start ${
                  columnHeader.index == "location" || columnHeader.index == "status" ? "max-sm:hidden" : ""
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wide text-gray-800 dark:text-gray-200 ${
                    columnHeader.index == "id" ? "max-sm:hidden" : ""
                  }`}
                >
                  {columnHeader.title}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {tableData.length > 0
            ? tableData.map((dataRow: any, dataKey: any) => (
                <tr key={dataKey}>
                  {columns.map((colRow: any) => (
                    <td
                      key={colRow.index}
                      className={`h-px w-auto whitespace-nowrap ${colRow.index == "location" || colRow.index == "status" ? "max-sm:hidden" : ""}`}
                    >
                      {colRow.render(dataRow[colRow.index], dataRow)}
                    </td>
                  ))}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="my-28">
                      <InboxArrowDownIcon className="text-slate-200 mx-auto text-[30px] w-20" />
                      <h2 className="text-center text-sm font-semibold text-gray-800">No Data</h2>
                    </div>
                  </td>
                </tr>
              )}
        </tbody>
      </table>
      {tableData.length > 0 && (
        <div className="flex items-center text-sm justify-end gap-2 p-4">
          <span className="text-gray-800">
            {metaData?.from} - {metaData?.to} of {metaData?.total} items
          </span>
          <span className=" items-center hidden max-sm:flex">
            <a
              href={linkData.prev}
              className="flex-grow min-w-9 mr-1 p-2  hover:bg-slate-100 text-gray-800 bg-slate-50 rounded cursor-pointer text-sm"
            >
              <ChevronLeftIcon />
            </a>
            <a
              href={linkData.next}
              className="flex-grow min-w-9 p-2  hover:bg-slate-100 text-gray-800 bg-slate-50 rounded cursor-pointer text-sm"
            >
              <ChevronRightIcon />
            </a>
          </span>
          <span className="flex items-center gap-1 max-sm:hidden">
            {metaData?.links.map((l: any, i: any) => (
              <button
                key={i}
                onClick={() => {
                  if (l.label.includes("Previous")) {
                    handleChange(metaData.per_page, metaData.current_page - 1);
                    return;
                  } else if (l.label.includes("Next")) {
                    handleChange(metaData.per_page, metaData.current_page + 1);
                    return;
                  } else {
                    handleChange(metaData.per_page, Number(l.label));
                  }
                }}
                disabled={!l.url}
                className={`${
                  l.active
                    ? "flex-grow min-w-9 p-2 border bg-slate-50 hover:bg-slate-100 text-gray-800 cursor-pointer rounded text-sm"
                    : "flex-grow min-w-9 p-2  hover:bg-slate-100 text-gray-800 bg-slate-50 rounded cursor-pointer text-sm"
                }`}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: l.label,
                  }}
                />
              </button>
            ))}
          </span>
          <span>
            <select
              className="text-sm w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-gray-800 cursor-pointer outline-none transition focus:border-blue-600 active:border-blue-600 disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-blue-600"
              onChange={(e) => {
                handleChange(Number(e.target.value), 1);
              }}
            >
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </span>
        </div>
      )}
    </>
  );
};

export default Table;

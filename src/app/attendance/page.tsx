"use client";

import { useRouter } from "next/navigation";
import { getAttendance } from "../services/attendance/api";
//@ts-ignore
import store from "store";
import { useEffect, useState, Fragment } from "react";
import moment from "moment";
import { getEvents } from "../services/events/api";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Table from "../components/Table";

const AttendancePage = () => {
  const router = useRouter();
  const token = store.get("accessToken");
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [tableLinksData, setTableLinksData] = useState();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [formFilterData, setFormFilterData] = useState({
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, []);

  const columns = [
    {
      title: "Name",
      index: "name",
      render: (dom: any, record: any) => {
        return (
          <div className="gird px-6 max-sm:px-1 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
            <span className="sm:hidden text-xs text-gray-800 dark:text-gray-200">{record.status || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Stats",
      index: "status",
      render: (dom: any) => {
        return (
          <div className="px-6 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Nickname",
      index: "nickname",
      render: (dom: any) => {
        return (
          <div className="px-6 max-sm:px-1 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Arrived",
      index: "checkin_time",
      render: (dom: any) => {
        return (
          <div className="px-6 max-sm:px-1 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    // handleGetAttendance(formFilterData);
    handleGetEvents({
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
    });
  }, []);

  const handleGetEvents = async (params: any) => {
    try {
      let res = await getEvents(params);
      setEvents(res?.data?.data);

      if (res?.data?.data) {
        handleGetAttendance({
          ...formFilterData,
          eventId: res?.data?.data[0]?.id,
        });
        setSelected(res?.data?.data[0]);
      }
    } catch (error) {
      console.log("Fetch events error: ", error);
    }
  };

  const handleGetAttendance = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getAttendance([], params);

      setTableData(res?.data.data);
      setTableMetaData(res?.data.meta);
      setTableLinksData(res?.data?.links);
      setFormFilterData({
        ...formFilterData,
        ["limit"]: res?.data.meta.per_page,
        ["page"]: res?.data.meta.current_page,
      });
    } catch (error) {
      console.log("error: ", error);
      // if (error?.response?.status == 401) {
      // let res = await  outLogin()
      // message.error('UnAuthenticated.')
      // store.remove('accessToken');
      // history.push('/')

      // }
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg p-0 xl:p-5 lg:p-5">
      <div>
        <h2 className="text-xl font-semibold max-lg:pl-2 text-gray-800 dark:text-gray-200">Attendance</h2>
      </div>
      <div className="my-6">
        <div className="max-lg:pl-2">
          <p className="text-gray-800 text-sm">Select event</p>
          <Listbox
            value={selected}
            onChange={(e: any) => {
              setSelected(e);
              handleGetAttendance({
                ...formFilterData,
                eventId: e.id,
              });
            }}
          >
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full h-10 cursor-default rounded-lg bg-slate-50 py-2 pl-3 pr-10 text-left border border-slate-200 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                {/* @ts-ignore */}
                <span className="block truncate text-black">{selected?.name}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                  {events.map((event: any, eventIdx) => (
                    <Listbox.Option
                      key={eventIdx}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-amber-100 text-amber-900" : "text-gray-900"
                        }`
                      }
                      value={event}
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                            {event?.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <div className="mt-3">
          <Table
            columns={columns}
            tableData={tableData}
            metaData={tableMetaData}
            linkData={tableLinksData}
            tableFn={handleGetAttendance}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;

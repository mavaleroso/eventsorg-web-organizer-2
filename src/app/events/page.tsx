"use client";

import { useRouter } from "next/navigation";
import Table from "../components/Table";
//@ts-ignore
import store from "store";
import moment from "moment";
import { ZodError, z } from "zod";
import { addEvent, deleteEvent, getEventById, getEvents, updateEvent } from "../services/events/api";
import toast from "react-hot-toast";
import Modal from "../components/Modal";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "../components/ConfirmDialog";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
//@ts-ignore
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { EllipsisVerticalIcon, PencilIcon, TrashIcon } from "@heroicons/react/20/solid";
import { logout } from "../services/authentication/api";

const localizer = momentLocalizer(moment);

const userFormSchema = z.object({
  name: z.string().min(1, {
    message: "Event name is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  start_date: z.string().min(1, {
    message: "Start date is required",
  }),
  end_date: z.string().min(1, {
    message: "End date is required",
  }),
});

interface interEventFormData {
  name: string;
  location: string;
  start_date: string;
  end_date: string;
}

const EventsPage = () => {
  const router = useRouter();
  const token = store.get("accessToken");
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [tableLinksData, setTableLinksData] = useState();
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [confirmDialogState, setConfirmDialogState] = useState(false);
  const [eventId, setEventId] = useState(null);
  const [formFilterData, setFormFilterData] = useState({
    start_date: moment().format("YYYY-MM-DD"),
    end_date: moment().format("YYYY-MM-DD"),
    limit: 10,
    page: 1,
  });

  const [date, setDate] = useState(new Date());

  const Views = {
    WEEK: "week",
    MONTH: "month",
    DAY: "day",
    AGENDA: "agenda",
  };

  const [view, setView] = useState(Views.MONTH);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, []);

  const initialFormData: interEventFormData = {
    name: "",
    location: "",
    start_date: "",
    end_date: "",
  };

  const columns = [
    {
      title: "Event name",
      index: "name",
      render: (dom: any, record: any) => {
        return (
          <div className="grid px-6 max-sm:px-1 py-2">
            <a
              onClick={() => {
                router.push(`/checkin?event_id=${dom}`);
              }}
              className="cursor-pointer "
            >
              <span className="font-semibold text-sm text-blue-600 dark:text-gray-200">{dom || "-"}</span>
            </a>
            <span className="sm:hidden text-xs text-gray-800 dark:text-gray-200">{record.location || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Location",
      index: "location",
      render: (dom: any) => {
        return (
          <div className="px-6 py-2">
            <span className="text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Start date",
      index: "start_date",
      render: (dom: any) => {
        return (
          <div className="px-6 max-sm:px-1 py-2">
            <span className=" text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "End date",
      index: "end_date",
      render: (dom: any) => {
        return (
          <div className="px-6 max-sm:px-1 py-2">
            <span className=" text-sm text-gray-800 dark:text-gray-200">{dom || "-"}</span>
          </div>
        );
      },
    },
    {
      title: "Actions",
      index: "id",
      render: (dom: any, record: any) => {
        return (
          <div>
            <Menu as="div" className="hidden relative max-sm:inline-block text-left">
              <div>
                <Menu.Button className="inline-flex w-full justify-center rounded-md text-gray-800 hover:bg-slate-100 p-2">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute z-50 w-[100px] right-0 mt-2 origin-top-right divide-y divide-gray-100 rounded-md bg-slate-100 shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="px-1 py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => editEvent(dom)}
                          className={`${
                            active ? "bg-blue-500 text-white" : "text-gray-900 bg-slate-100"
                          } group flex w-full items-center rounded-md px-2 py-2 text-[14px]`}
                        >
                          {active ? (
                            <PencilIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          ) : (
                            <PencilIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          )}
                          Edit
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => handleDeleteEvent(dom)}
                          className={`${
                            active ? "bg-blue-500 text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-[14px]`}
                        >
                          {active ? (
                            <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          ) : (
                            <TrashIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                          )}
                          Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <div className="flex items-center justify-center gap-1 max-sm:hidden">
              <button
                onClick={() => editEvent(dom)}
                className="bg-blue-500 text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 xl:mr-1 lg:mr-1"
                >
                  <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .98.98l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                  <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
                </svg>
                <span className="hidden xl:block lg:block">Edit</span>
              </button>
              <button
                onClick={() => handleDeleteEvent(dom)}
                className="bg-red-500 text-white rounded text-sm px-2 py-1 hover:bg-opacity-50 inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 xl:mr-1 lg:mr-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6a.75.75 0 0 1 .787.713l.275 5.5a.75.75 0 0 1-1.498.075l-.275-5.5A.75.75 0 0 1 6.05 6Zm3.9 0a.75.75 0 0 1 .712.787l-.275 5.5a.75.75 0 0 1-1.498-.075l.275-5.5a.75.75 0 0 1 .786-.711Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden xl:block lg:block">Delete</span>
              </button>
            </div>
          </div>
        );
      },
    },
  ];

  function handleFormatEvents() {
    let eventLists: { key: number; id: any; title: any; location: any; start: Date; end: Date }[] = [];
    tableData?.map((item, key) => {
      // @ts-ignore
      var isafter = moment(item?.start_date).isSameOrAfter(moment().format("YYYY-MM-DD"));
      // @ts-ignore
      var isBefore = moment(item?.end_date).isSameOrAfter(moment().format("YYYY-MM-DD"));

      if (isafter || isBefore) {
        let obj = {
          key: key,
          // @ts-ignore
          id: item?.id,
          // @ts-ignore
          title: item?.name,
          // @ts-ignore
          location: item?.location,
          // @ts-ignore
          start: new Date(Date.parse(item?.start_date)),
          // @ts-ignore
          end: new Date(Date.parse(item?.end_date)),
        };
        eventLists.push(obj);
      }
    });

    return eventLists;
  }

  useEffect(() => {
    handleGetEvents(formFilterData);
  }, []);

  const handleGetEvents = async (params: any) => {
    setLoading(true);
    setTableData([]);
    try {
      let res = await getEvents([], params);

      setTableData(res?.data.data);
      setTableMetaData(res?.data.meta);
      setTableLinksData(res?.data.links);

      setFormFilterData({
        ...formFilterData,
        ["limit"]: res?.data.meta.per_page,
        ["page"]: res?.data.meta.current_page,
      });
    } catch (error) {
      console.log("error: ", error);
      //@ts-ignore
      if (error?.response?.status == 401) {
        let res = await logout();
        toast.error("UnAuthenticated.");
        store.clearAll();
        router.push("/login");
      }
    }
    setLoading(false);
  };

  const editEvent = async (id: any) => {
    try {
      toast.loading("Loading...");
      const res = await getEventById(id);
      setEventFormData(res?.data?.data);
      toast.dismiss();
    } catch (error) {
      console.log("Fetch event", error);
      //@ts-ignore
      if (error?.response?.status == 401) {
        let res = await logout();
        toast.error("UnAuthenticated.");
        store.clearAll();
        router.push("/login");
      }
    }
    setIsNew(false);
    setModalState(true);
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  const [eventFormData, setEventFormData] = useState<interEventFormData>(initialFormData);

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(null);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setEventFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors(null);

    try {
      await userFormSchema.parseAsync(eventFormData);

      await toast.promise(addEvent(eventFormData, {}), {
        loading: "Loading...",
        success: "Successfully Created!",
        error: "Error data creation.",
      });

      setModalState(false);
      setEventFormData(initialFormData);
      handleGetEvents(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationErrors(error);
        console.error("Form validation failed:", error.errors);
        //@ts-ignore
        if (error?.response?.status == 401) {
          let res = await logout();
          toast.error("UnAuthenticated.");
          store.clearAll();
          router.push("/login");
        }
      }
    }
  };

  const handleEventUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await userFormSchema.parseAsync(eventFormData);

      await toast.promise(updateEvent(eventFormData, {}), {
        loading: "Loading...",
        success: "Successfully Updated!",
        error: "Error data update.",
      });

      setModalState(false);
      setEventFormData(initialFormData);
      handleGetEvents(formFilterData);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        setValidationErrors(error);
        console.error("Form validation failed:", error.errors);
        //@ts-ignore
        if (error?.response?.status == 401) {
          let res = await logout();
          toast.error("UnAuthenticated.");
          store.clearAll();
          router.push("/login");
        }
      }
    }
  };

  const handleConfirmDialog = (state: boolean) => {
    setConfirmDialogState(state);
  };

  const handleConfirmDelete = async () => {
    try {
      await toast.promise(deleteEvent(eventId, {}), {
        loading: "Loading...",
        success: "Successfully Deleted!",
        error: "Error data deletion.",
      });
      setConfirmDialogState(false);
      setEventFormData(initialFormData);
      handleGetEvents(formFilterData);
    } catch (error) {
      console.log("delete user error", error);
      //@ts-ignore
      if (error?.response?.status == 401) {
        let res = await logout();
        toast.error("UnAuthenticated.");
        store.clearAll();
        router.push("/login");
      }
    }
  };

  const handleDeleteEvent = (id: any) => {
    setEventId(id);
    setConfirmDialogState(true);
  };

  return (
    <div className="bg-white rounded-lg p-0 xl:p-5 lg:p-5">
      <div className="border-b border-gray-200 px-4 dark:border-gray-700">
        <div className="py-4 grid grid-cols-2 gap-3 md:flex md:justify-between md:items-center dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Events</h2>
          </div>
          <div className="inline-flex gap-x-2 justify-end">
            <button
              onClick={() => {
                setModalState(true);
                setValidationErrors(null);
                setEventFormData(initialFormData);
                setIsNew(true);
              }}
              className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            >
              <svg
                className="flex-shrink-0 size-4"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Create
            </button>
          </div>
        </div>

        <nav className="flex space-x-2" aria-label="Tabs" role="tablist">
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600 active"
            id="basic-tabs-item-1"
            data-hs-tab="#basic-tabs-1"
            aria-controls="basic-tabs-1"
            role="tab"
          >
            List
          </button>
          <button
            type="button"
            className="hs-tab-active:font-semibold hs-tab-active:border-blue-600 hs-tab-active:text-blue-600 py-4 px-1 inline-flex items-center gap-x-2 border-b-2 border-transparent text-sm whitespace-nowrap text-gray-500 hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none dark:text-gray-400 dark:hover:text-blue-500 dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            id="basic-tabs-item-2"
            data-hs-tab="#basic-tabs-2"
            aria-controls="basic-tabs-2"
            role="tab"
          >
            Calendar
          </button>
        </nav>
      </div>

      <div className="mt-3 p-4">
        <div id="basic-tabs-1" className="overflow-x-auto" role="tabpanel" aria-labelledby="basic-tabs-item-1">
          <ConfirmDialog
            state={confirmDialogState}
            title={"Delete event"}
            message={"Are you sure you want to delete this event?"}
            dialogFn={handleConfirmDialog}
            confirmFn={handleConfirmDelete}
          />
          <Modal modalState={modalState} modalFn={handleModal} modalWidth={"w-full max-w-md z-999999"} close={true}>
            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-black dark:text-white mb-5">
              {isNew ? "New" : "Edit"} event
            </Dialog.Title>
            <form onSubmit={(e) => (isNew ? handleEventSubmit(e) : handleEventUpdate(e))}>
              <div className="grid lg:grid-cols-1 gap-4">
                <div>
                  <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                    <span className="ml-3">Event name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Please enter"
                    value={eventFormData.name}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${
                      validationErrors?.issues.some((issue) => issue.path[0] === "name")
                        ? "focus:border-danger active:border-danger dark:focus:border-danger border-danger"
                        : "focus:border-primary active:border-primary dark:focus:border-primary border-stroke"
                    }`}
                  />
                  {validationErrors?.errors && validationErrors.errors.length > 0 && (
                    <div className="text-red-500 text-sm">
                      {validationErrors.errors
                        .filter((error) => error.path[0] === "name")
                        .map((error, index) => (
                          <p key={index}>{error.message}</p>
                        ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                    <span className="ml-3">Location name</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Please enter"
                    value={eventFormData.location}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${
                      validationErrors?.issues.some((issue) => issue.path[0] === "location")
                        ? "focus:border-danger active:border-danger dark:focus:border-danger border-danger"
                        : "focus:border-primary active:border-primary dark:focus:border-primary border-stroke"
                    }`}
                  />
                  {validationErrors?.errors && validationErrors.errors.length > 0 && (
                    <div className="text-red-500 text-sm">
                      {validationErrors.errors
                        .filter((error) => error.path[0] === "location")
                        .map((error, index) => (
                          <p key={index}>{error.message}</p>
                        ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                    <span className="ml-3">Start date</span>
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    placeholder="Please enter"
                    value={eventFormData.start_date}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${
                      validationErrors?.issues.some((issue) => issue.path[0] === "start_date")
                        ? "focus:border-danger active:border-danger dark:focus:border-danger border-danger"
                        : "focus:border-primary active:border-primary dark:focus:border-primary border-stroke"
                    }`}
                  />
                  {validationErrors?.errors && validationErrors.errors.length > 0 && (
                    <div className="text-red-500 text-sm">
                      {validationErrors.errors
                        .filter((error) => error.path[0] === "start_date")
                        .map((error, index) => (
                          <p key={index}>{error.message}</p>
                        ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="relative mb-3 block text-sm font-medium text-black dark:text-white">
                    <span className="ml-3">End date</span>
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    placeholder="Please enter"
                    value={eventFormData.end_date}
                    onChange={handleInputChange}
                    className={`w-full rounded-lg border-[1.5px]  bg-transparent px-4 py-2 text-black outline-none transition  disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white ${
                      validationErrors?.issues.some((issue) => issue.path[0] === "end_date")
                        ? "focus:border-danger active:border-danger dark:focus:border-danger border-danger"
                        : "focus:border-primary active:border-primary dark:focus:border-primary border-stroke"
                    }`}
                  />
                  {validationErrors?.errors && validationErrors.errors.length > 0 && (
                    <div className="text-red-500 text-sm">
                      {validationErrors.errors
                        .filter((error) => error.path[0] === "end_date")
                        .map((error, index) => (
                          <p key={index}>{error.message}</p>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {isNew ? "Create" : "Update"}
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  onClick={() => {
                    setModalState(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          <Table
            columns={columns}
            tableData={tableData}
            metaData={tableMetaData}
            linkData={tableLinksData}
            tableFn={handleGetEvents}
            loading={loading}
          />
        </div>
        <div id="basic-tabs-2" className="hidden" role="tabpanel" aria-labelledby="basic-tabs-item-2">
          <div className="w-full h-full">
            {!loading && (
              <Calendar
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                localizer={localizer}
                defaultView={view}
                view={view}
                onView={(view: any) => setView(view)}
                events={handleFormatEvents()}
                startAccessor="start"
                endAccessor="end"
                date={date}
                onNavigate={(date: any) => {
                  setDate(new Date(date));
                }}
                className="p-4 rounded-lg bg-slate-50 h-screen w-full text-gray-800"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;

"use client";

import { useRouter } from "next/navigation";
import { getAttendance } from "../services/attendance/api";
//@ts-ignore
import store from "store";
import { useEffect, useState, Fragment } from "react";
import moment from "moment";
import { getEvents } from "../services/events/api";
import { Listbox, Transition } from "@headlessui/react";
import { CameraIcon, CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import Table from "../components/Table";
import Tesseract from "tesseract.js";
//@ts-ignore
import fx from "glfx";
import QrReader from "react-web-qr-reader";
import toast from "react-hot-toast";
import { postAttendance } from "../services/checkin/api";
import Modal from "../components/Modal";
import { logout } from "../services/authentication/api";

const CheckinPage = () => {
  const router = useRouter();
  const token = store.get("accessToken");
  const [tableData, setTableData] = useState([]);
  const [tableMetaData, setTableMetaData] = useState();
  const [tableLinksData, setTableLinksData] = useState();
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('user');
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [delay, setDelay] = useState(100);
  const [cameraOption, setCameraOption] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isOcr, setIsOcr] = useState(false);
  const [userInfo, setuserInfo] = useState([]);
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
    handleGetEvents({
      start_date: moment().format("YYYY-MM-DD"),
      end_date: moment().format("YYYY-MM-DD"),
    });
  }, []);

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
      //@ts-ignore
      if (error?.response?.status == 401) {
        let res = await logout()
        toast.error('UnAuthenticated.')
        store.clearAll();
        router.push('/login')
      }
    }
    setLoading(false);
  };

  const handleGetEvents = async (params: any) => {
    const searchParams = new URLSearchParams(window.location.search);

    const param1 = searchParams.get("event_id");
    try {
      let res = await getEvents(params);
      if (res?.data?.data.length == 0) {
        setModalState(true);
      } else {
        setEvents(res?.data?.data);
        setCameraOption("QR");
        handleGetAttendance({
          ...formFilterData,
          eventId: res?.data?.data[0]?.id,
        });
        setEventId(param1 ?? res?.data?.data[0]?.id);
      }
    } catch (error) {
      console.log("Fetch events error: ", error);
      //@ts-ignore
      if (error?.response?.status == 401) {
        let res = await logout()
        toast.error('UnAuthenticated.')
        store.clearAll();
        router.push('/login')
      }
    }
  };

  const handleModal = (state: boolean) => {
    setModalState(state);
  };

  const handleScan = async (data: any) => {
    if (data) {
      toast.success("Scanned QR code");
      // setResult(data?.data);
      handleAttendance(data?.data);
      setCameraOption("");
    }
  };

  const handleAttendance = (data: any) => {
    setIsScanning(true);

    let payload = {
      event_id: eventId,
      id_no: data,
    };

    postAttendance(payload)
      .then((res) => {
        setuserInfo(res?.data?.data);
        toast.success("Attendance saved.");
        handleGetEvents({
          start_date: moment().format("YYYY-MM-DD"),
          end_date: moment().format("YYYY-MM-DD"),
        });
      })
      .catch((error) => {
        console.log(error);
        toast.error(error?.response?.data?.message);
      })
      .finally(() => {
        setIsScanning(false);
        setCameraOption("QR");
      });
  };

  useEffect(() => {
    console.log(`start scan ${isOcr}`);

    const intervalId = setInterval(() => {
      if (isOcr) {
        setTimeout(captureFrame, 1500);
      } else {
        clearInterval(intervalId);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isOcr]);

  const captureFrame = () => {
    var fxCanvas = null;
    var texture = null;
    var canvas = document.querySelector("canvas");
    var video = document.querySelector("video");

    if (video && canvas) {
      fxCanvas = fx.canvas();

      canvas.width = video?.videoWidth;
      canvas.height = video?.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      texture = fxCanvas.texture(canvas);
      fxCanvas.draw(texture).hueSaturation(-1, -1).unsharpMask(20, 2).brightnessContrast(0.2, 0.9).update();

      console.log("scanning...");
      toast.dismiss();
      toast.loading("OCR Scanning...");

      Tesseract.recognize(fxCanvas.toDataURL()).then(function (result) {
        const filteredText = result ? result.data.text.replace(/[^A-Z0-9]/g, "") : "";
        console.log(`done: ${filteredText}`);
        toast.dismiss();
        if (filteredText.length > 3) {
          handleAttendance(filteredText);
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg p-0 lg:p-5">
      <div>
        <h2 className="text-xl font-semibold max-lg:p-3 text-gray-800 dark:text-gray-200">Check-in</h2>
      </div>
      <Modal
        modalState={modalState}
        modalFn={handleModal}
        close={false}
        modalWidth="w-full max-w-sm"
      >
        <div className="h-full flex flex-col items-center justify-center gap-4 content-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-32 h-32 text-blue-500 drop-shadow-md"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clipRule="evenodd"
            />
          </svg>

          <div>
            <h1 className="text-title-md font-bold text-black">No active events</h1>
            <p className="text-lg font-semibold text-center">Check again later.</p>
          </div>

          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:opacity-75"
            onClick={() => {
              setModalState(false);
              router.push('/events');
            }}
          >
            Ok
          </button>
        </div>
      </Modal>
      <div className="my-3">
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1 p-5 max-sm:p-3">
          <div className="p-4 border border-slate-200 my-4 rounded-md">
            <div className="flex items-center justify-center gap-1">
              <select
                onChange={(e: any) => {
                  setEventId(e.target.value);
                  setCameraOption("QR");
                  handleGetAttendance(e.target.value);
                }}
                className="border border-slate-400 rounded-lg w-full py-2 my-3 text-gray-800"
              >
                {events?.map((event: any) => (
                  <option key={event.id} value={event.id} className="text-center">
                    {event.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  setCameraFacing(cameraFacing == 'user' ? 'environment' : 'user')
                }}
                className={` font-semibold hover:opacity-70 rounded-md px-4 py-2 text-sm bg-blue-500 text-white `}
              >
                <CameraIcon className="flex-grow h-5 w-5" />
              </button>
              <button
                onClick={() => {
                  captureFrame();
                  if (isOcr) {
                    setIsOcr(false);
                    toast.dismiss();
                    toast.error("OCR scanning stopped");
                  } else {
                    setIsOcr(true);
                    toast.success("OCR scanning started");
                  }
                }}
                className={` font-semibold hover:opacity-70 rounded-md px-4 py-2 text-sm ${
                  isOcr ? "bg-blue-500 text-white" : "bg-slate-200 text-black"
                }`}
              >
                OCR
              </button>
            </div>
            {isScanning ? (
              <h2 className="font-semibold text-center text-black dark:text-white">Scanning...</h2>
            ) : (
              <div className="w-40 h-40 bg-slate-100 rounded-lg border border-dashed mx-auto">
                {cameraOption == "QR" ? (
                  <QrReader
                    delay={delay}
                    //style={previewStyle}
                    onScan={(data: any) => {
                      handleScan(data);
                    }}
                    //@ts-ignore
                    facingMode={cameraFacing}
                    style={{ width: "100%", height: "100%" }}
                    onError={() => {}}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center content-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-18 h-18"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-4 border border-slate-200 my-4 rounded-md grid grid-cols-2 gap-4">
            <div
              className={`h-full flex items-center justify-center content-center ${
                //  @ts-ignore
                !userInfo?.first_name ? "col-span-2" : ""
              }`}
            >
              {/* @ts-ignore */}
              {userInfo?.photo ? (
                //@ts-ignore
                <img src={userInfo?.photo} alt="" className="w-50 h-50 bg-slate-100 rounded-lg border border-dashed" />
              ) : (
                <img
                  src="data:image/png;base64,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"
                  alt=""
                  className="w-50 h-50 bg-slate-100 rounded-lg border border-dashed"
                />
              )}
            </div>
            {/* @ts-ignore */}
            {userInfo?.first_name && (
              <div className="mt-5">
                <h3 className="font-bold text-slate-700 dark:text-white text-title-md text-center">Welcome</h3>
                <p className="text-center font-semibold text-black dark:text-white text-title-sm  mt-3">
                  {/* @ts-ignore */}
                  {userInfo?.first_name} {userInfo?.last_name}
                </p>
                {/* @ts-ignore */}
                <p className="text-center font-semibold dark:text-white text-lg ">{userInfo?.status}</p>
                <p className="text-center font-semibold text-slate-500 dark:text-white text-lg mt-4">
                  {/* @ts-ignore */}

                  {userInfo?.city}
                </p>
              </div>
            )}
          </div>
        </div>
        <canvas className="hidden"></canvas>
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

export default CheckinPage;

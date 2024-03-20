"use client";

import { ZodError, z } from "zod";
import { useRouter } from "next/navigation";
//@ts-ignore
import store from "store";
import { useState } from "react";
import toast from "react-hot-toast";
import { login } from "../services/authentication/api";

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required",
    })
    .email({ message: "Invalid email format" }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});

interface FormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const router = useRouter();
  const token = store.get("accessToken");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState<ZodError | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      await loginFormSchema.parseAsync(formData);
      const msg = await login({ ...formData });

      if (msg.data.status == "success") {
        store.set("accessToken", msg.data.token);
        store.set("email", formData.email);
        toast.success("Successfully login!");
        router.push("/events");
      }

      setIsLoading(false);
    } catch (error) {
      if (error instanceof ZodError) {
        setValidationErrors(error);
        console.error("Form validation failed:", error.errors);
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="dark:bg-slate-900 text-gray-800 bg-gray-100 flex h-screen items-center py-16">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="p-4 sm:p-7">
              <div className="text-center">
                <h1 className="block text-2xl font-bold text-gray-800 dark:text-white">EventsOrg</h1>
                <p className="text-gray-400 text-sm">Login to access the app</p>
              </div>
              <div className="mt-5">
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm mb-2 dark:text-white">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-700 dark:border-transparent dark:text-gray-400 dark:focus:ring-gray-600"
                          placeholder="Enter email"
                        />

                        <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                          <svg
                            className="flex-shrink-0 size-4 text-gray-500"
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
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      </div>
                      {validationErrors?.errors && validationErrors.errors.length > 0 && (
                        <>
                          {validationErrors.errors
                            .filter((error) => error.path[0] === "email")
                            .map((error, index) => (
                              <p className="text-xs text-red-600 mt-2" id="email-error" key={index}>
                                {error.message}
                              </p>
                            ))}
                        </>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center">
                        <label htmlFor="password" className="block text-sm mb-2 dark:text-white">
                          Password
                        </label>
                      </div>
                      <div className="outline-none relative ">
                        <input
                          type="password"
                          name="password"
                          onChange={handleInputChange}
                          className="peer py-3 px-4 ps-11 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-700 dark:border-transparent dark:text-gray-400 dark:focus:ring-gray-600"
                          placeholder="Enter password"
                        />
                        <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none ps-4 peer-disabled:opacity-50 peer-disabled:pointer-events-none">
                          <svg
                            className="flex-shrink-0 size-4 text-gray-500"
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
                            <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                            <circle cx="16.5" cy="7.5" r=".5" />
                          </svg>
                        </div>
                      </div>
                      {validationErrors?.errors && validationErrors.errors.length > 0 && (
                        <>
                          {validationErrors.errors
                            .filter((error) => error.path[0] === "password")
                            .map((error, index) => (
                              <p className="text-xs text-red-600 mt-2" id="password-error" key={index}>
                                {error.message}
                              </p>
                            ))}
                        </>
                      )}
                    </div>

                    <button
                      disabled={!formData.email || !formData.password}
                      className="mt-5 w-full py-3 px-4 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
                    >
                      {isLoading && (
                        <span
                          className="animate-spin inline-block size-4 border-[3px] border-current border-t-transparent text-white rounded-full"
                          role="status"
                          aria-label="loading"
                        ></span>
                      )}
                      Sign in
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;

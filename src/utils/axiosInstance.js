import axios from "axios";
import Swal from "sweetalert2";

let isSessionExpiredShown = false; // prevents multiple popups

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
});

const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (!isSessionExpiredShown) {
        isSessionExpiredShown = true;

        await Swal.fire({
          title: '<span style="color: #1e293b; font-weight: 800; font-family: sans-serif;">SESSION EXPIRED</span>',
          html: '<p style="color: #64748b; font-size: 0.9rem;">Your security token is no longer valid. <br/> Please re-authenticate to continue.</p>',
          icon: "info",
          iconColor: "red",
          confirmButtonText: "Return to Login",
          confirmButtonColor: "black", 
          background: "#ffffff",
          showClass: {
            popup: 'animate__animated animate__fadeInDown animate__faster'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp animate__faster'
          },
          // Customizing the structural elements
          customClass: {
            popup: 'rounded-3xl border border-slate-200 shadow-2xl',
            confirmButton: 'px-8 py-3 rounded-xl font-bold uppercase text-white tracking-widest bg-zinc-900 text-xs transition-all hover:bg-zinc-800',
          },
          buttonsStyling: false, // Set to false if you want to use pure Tailwind classes in confirmButton
          allowOutsideClick: false,
        });

        logoutUser();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

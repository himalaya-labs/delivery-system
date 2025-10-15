import { Box, CircularProgress } from "@mui/material";
import { useJsApiLoader } from "@react-google-maps/api";
import React, { useEffect, useContext, useState } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { getToken, onMessage } from "firebase/messaging";
import { initialize, isFirebaseSupported } from "./firebase";
import ConfigurableValues from "./config/constants";
import Checkout from "./screens/Checkout/Checkout";
import EmailSent from "./screens/EmailSent/EmailSent";
import Favourites from "./screens/Favourites/Favourites";
import ForgotPassword from "./screens/ForgotPassword/ForgotPassword";
import Home from "./screens/Home/Home";
import Login from "./screens/Login/Login";
import LoginEmail from "./screens/LoginEmail/LoginEmail";
import MyOrders from "./screens/MyOrders/MyOrders";
import NewLogin from "./screens/NewLogin/NewLogin";
import OrderDetail from "./screens/OrderDetail/OrderDetail";
import Paypal from "./screens/Paypal/Paypal";
import Privacy from "./screens/Privacy/Privacy";
import Profile from "./screens/Profile/Profile";
import Settings from "./screens/Settings/Settings";
import Registration from "./screens/Registration/Registration";
import PhoneNumber from "./screens/PhoneNumber/PhoneNumber";
import VerifyEmail from "./screens/VerifyEmail/VerifyEmail";
import VerifyForgotOtp from "./screens/VerifyForgotOtp/VerifyForgotOtp";
import ResetPassword from "./screens/ResetPassword/ResetPassword";
import RestaurantDetail from "./screens/RestaurantDetail/RestaurantDetail";
import Stripe from "./screens/Stripe/Stripe";
import Terms from "./screens/Terms/Terms";
import FlashMessage from "./components/FlashMessage";
import Pickup from "./screens/Pickup/Pickup";
import * as Sentry from "@sentry/react";
import AuthRoute from "./routes/AuthRoute";
import PrivateRoute from "./routes/PrivateRoute";
import VerifyPhone from "./screens/VerifyPhone/VerifyPhone";
import UserContext from "./context/User";
import { useTranslation } from "react-i18next";
import AddYourBusiness from "./screens/AddYourBusiness";
import BusinessList from "./screens/BusinessList";
import LandingPage from "./screens/LandingPage";
import SignupAsRider from "./screens/SignupAsRider";
import ContactUs from "./screens/ContactUs";
import PickupMandoob from "./screens/DeliveryRequest/PickupMandoob";
import DropoffMandoob from "./screens/DeliveryRequest/DropoffMandoob";
import DeliveryRequest from "./screens/DeliveryRequest";
import DownloadPage from "./screens/DownloadPage";
import DownloadBusinessPage from "./screens/DownloadBusinessPage";
const GoogleMapsLoader = ({
  children,
  LIBRARIES,
  GOOGLE_MAPS_KEY,
  VAPID_KEY,
}) => {
  const [message, setMessage] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const initializeFirebase = async () => {
      if (await isFirebaseSupported()) {
        const messaging = initialize();
        Notification.requestPermission()
          .then(() => {
            getToken(messaging, {
              vapidKey: VAPID_KEY,
            })
              .then((token) => {
                localStorage.setItem("messaging-token", token);
              })
              .catch((err) => {
                console.log("getToken error", err);
              });
          })
          .catch(console.log);

        onMessage(messaging, function (payload) {
          // Customize notification here
          const { title, body } = payload.notification;
          var localizedBody = body;
          var orderNo = "";
          var localizedTitle = title;
          const createMessage = (orderNo, localizedTitle, localizedBody) => {
            return i18n.language === "ar"
              ? `${orderNo} ${localizedTitle} ${localizedBody}`
              : `${localizedTitle} ${localizedBody} ${orderNo}`;
          };
          if (title.startsWith("Order status:")) {
            localizedTitle = t(title);
            const orderIdIndex = body.indexOf("Order ID");
            orderNo = body.slice(orderIdIndex + 9).trim();
            localizedBody = t("Order ID");
            setMessage(createMessage(orderNo, localizedTitle, localizedBody));
          } else if (title === "Order placed") {
            localizedTitle = t("orderPlaced");
            const orderIdIndex = body.indexOf("Order ID");
            orderNo = body.slice(orderIdIndex + 9).trim();
            localizedBody = t("Order ID");
            setMessage(createMessage(orderNo, localizedTitle, localizedBody));
          } else {
            console.log(localizedTitle, localizedBody);
            setMessage(`${localizedTitle} ${localizedBody}`);
          }
        });
      }
    };
    initializeFirebase();
  }, [t, i18n, VAPID_KEY]);

  /* ß */

  const handleClose = () => {
    setMessage(null);
  };

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
    language: "ar",
    region: "EG",
  });
  console.log("isLoaded ", isLoaded);
  if (!isLoaded) {
    return (
      <Box
        component="div"
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      {children}
      <FlashMessage
        severity={"info"}
        alertMessage={message}
        open={message !== null}
        handleClose={handleClose}
      />
    </>
  );
};

function App() {
  const { GOOGLE_MAPS_KEY, LIBRARIES, VAPID_KEY, SENTRY_DSN } =
    ConfigurableValues();
  const { isLoggedIn } = useContext(UserContext);

  useEffect(() => {
    if (SENTRY_DSN) {
      Sentry.init({
        dsn: SENTRY_DSN,
        //SENTRY_DSN  integrations: [new Integrations.BrowserTracing()],
        environment: "development",
        enableInExpoDevelopment: true,
        debug: true,
        tracesSampleRate: 1.0, // to be changed to 0.2 in production
      });
    }
  }, [SENTRY_DSN]);

  return GOOGLE_MAPS_KEY ? (
    <HashRouter>
      <GoogleMapsLoader
        GOOGLE_MAPS_KEY={GOOGLE_MAPS_KEY}
        LIBRARIES={LIBRARIES}
        VAPID_KEY={VAPID_KEY}
      >
        <Routes>
          <Route path="/" element={isLoggedIn ? <BusinessList /> : <Home />} />
          <Route path="/business-list" element={<BusinessList />} />
          <Route path="/landing1" element={<LandingPage />} />
          <Route path="/add-your-business" element={<AddYourBusiness />} />
          <Route path="/signup-as-rider" element={<SignupAsRider />} />
          <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/pickup" element={<Pickup />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/download-business" element={<DownloadBusinessPage />} />
          {/* <Route path="/otlob-mandoob" element={<DeliveryRequest />} />
          <Route path="/otlob-mandoob/pickup" element={<PickupMandoob />} />
          <Route path="/otlob-mandoob/dropoff" element={<DropoffMandoob />} /> */}
          <Route path={"/verify-phone"} element={<VerifyPhone />} />
          <Route
            path={"/login"}
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path={"/registration"}
            element={
              <AuthRoute>
                <Registration />
              </AuthRoute>
            }
          />
          <Route
            path={"/new-login"}
            element={
              <AuthRoute>
                <NewLogin />
              </AuthRoute>
            }
          />
          <Route
            path={"/login-email"}
            element={
              <AuthRoute>
                <LoginEmail />
              </AuthRoute>
            }
          />
          <Route
            path={"/verify-email"}
            element={
              <AuthRoute>
                <VerifyEmail />
              </AuthRoute>
            }
          />
          <Route
            path={"/new-password"}
            element={
              <AuthRoute>
                <ResetPassword />
              </AuthRoute>
            }
          />
          <Route
            path={"/phone-number"}
            element={
              <PrivateRoute>
                <PhoneNumber />
              </PrivateRoute>
            }
          />
          {/* <Route
            path={"/verify-phone"}
            element={
              <PrivateRoute>
                <VerifyPhone />
              </PrivateRoute>
            }
          /> */}

          <Route
            path={"/forgot-password"}
            element={
              <AuthRoute>
                <ForgotPassword />
              </AuthRoute>
            }
          />
          <Route
            path={"/verify-forgot-otp"}
            element={
              <AuthRoute>
                <VerifyForgotOtp />
              </AuthRoute>
            }
          />
          <Route
            path={"/email-sent"}
            element={
              <AuthRoute>
                <EmailSent />
              </AuthRoute>
            }
          />
          <Route
            path={"/orders"}
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />
          <Route
            path={"/profile"}
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path={"/settings"}
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path={"/checkout"}
            element={isLoggedIn ? <Checkout /> : <Login />}
          />
          <Route
            path={"/order-detail/:id"}
            element={
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            }
          />
          <Route
            path={"/paypal"}
            element={
              <PrivateRoute>
                <Paypal />
              </PrivateRoute>
            }
          />
          <Route
            path={"/stripe"}
            element={
              <PrivateRoute>
                <Stripe />
              </PrivateRoute>
            }
          />
          <Route
            path={"/favourite"}
            element={
              <PrivateRoute>
                <Favourites />
              </PrivateRoute>
            }
          />
        </Routes>
      </GoogleMapsLoader>
    </HashRouter>
  ) : (
    <Box
      component="div"
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
    >
      <CircularProgress color="primary" />
    </Box>
  );
}

export default Sentry.withProfiler(App);

/* eslint-disable react-hooks/exhaustive-deps */
import { useQuery } from "@apollo/client";
import {
  Button,
  CircularProgress,
  Container,
  Hidden,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import gql from "graphql-tag";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { getDeliveryCalculation, getTaxation } from "../../../apollo/server";
import ConfigurationContext from "../../../context/Configuration";
import UserContext from "../../../context/User";
import { useRestaurant } from "../../../hooks";
import useStyles from "./styles";
import { Fragment } from "react";

const TAXATION = gql`
  ${getTaxation}
`;

function MRestaurantCart(props) {
  const theme = useTheme();
  const classes = useStyles();
  const [loadingData, setLoadingData] = useState(true);
  const {
    cart,
    cartCount,
    clearCart,
    updateCart,
    restaurant: cartRestaurant,
  } = useContext(UserContext);
  const configuration = useContext(ConfigurationContext);
  const { loading: loadingTax } = useQuery(TAXATION, {
    fetchPolicy: "network-only",
  });
  const { loading, data } = useRestaurant(cartRestaurant);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const restaurantData = data?.restaurantCustomer ?? null;
  const location = JSON.parse(localStorage.getItem("location"));

  const {
    data: calcData,
    loading: calcLoading,
    error: errorCalc,
  } = useQuery(getDeliveryCalculation, {
    skip: !restaurantData,
    variables: {
      input: {
        destLong: Number(location.longitude),
        destLat: Number(location.latitude),
        originLong: Number(restaurantData?.location.coordinates[0]),
        originLat: Number(restaurantData?.location.coordinates[1]),
        restaurantId: restaurantData?._id,
      },
    },
  });

  console.log({
    calcData,
    originLong: restaurantData?.location.coordinates[0],
    originLat: restaurantData?.location.coordinates[1],
  });

  useEffect(() => {
    if (calcData) {
      const amount = calcData.getDeliveryCalculation.amount;
      setDeliveryCharges(amount);
      // setDeliveryCharges(
      //   amount >= configuration.minimumDeliveryFee
      //     ? amount
      //     : configuration.minimumDeliveryFee
      // );
    }
  }, [calcData]);

  useEffect(() => {
    if (restaurantData) {
      console.log("here");
      didFocus();
    }
  }, [restaurantData, cartCount]);

  const didFocus = async () => {
    const foods = restaurantData.categories.map((c) => c.foods.flat()).flat();
    const { addons, options } = restaurantData;
    try {
      if (cart && cartCount) {
        const transformCart = cart.map((cartItem) => {
          const foodItem = foods.find((food) => food._id === cartItem._id);
          console.log({ foodItem });

          if (!foodItem) return null;
          const variationItem = foodItem.variations.find(
            (variation) => variation._id === cartItem.variation._id
          );
          if (!variationItem) return null;
          const foodItemTitle = `${foodItem.title}(${variationItem.title})`;
          let foodItemPrice = variationItem.price;
          let optionTitles = [];
          if (cartItem.addons) {
            cartItem.addons.forEach((addon) => {
              const cartAddon = addons.find((add) => add._id === addon._id);
              if (!cartAddon) return null;
              addon.options.forEach((option) => {
                const cartOption = options.find(
                  (opt) => opt._id === option._id
                );
                if (!cartOption) return null;
                foodItemPrice += cartOption.price;
                optionTitles.push(cartOption.title);
              });
            });
          }
          return {
            ...cartItem,
            title: foodItemTitle,
            foodTitle: foodItem.title,
            variationTitle: variationItem.title,
            optionTitles,
            price: foodItemPrice.toFixed(2),
          };
        });
        const updatedItems = transformCart.filter((item) => item);
        if (updatedItems.length === 0) await clearCart();
        await updateCart(updatedItems);
        // setLoadingData((prev) => {
        //   if (prev) return false;
        //   else return prev;
        // });
        if (transformCart.length !== updatedItems.length) {
          props.showMessage({
            type: "warning",
            message: "One or more item is not available",
          });
        }
      }
    } catch (e) {
      props.showMessage({
        type: "error",
        message: e.message,
      });
    } finally {
      setLoadingData(false);
    }
  };

  const calculatePrice = useMemo(
    () =>
      (amount = 0) => {
        let itemTotal = 0;
        cart.forEach((cartItem) => {
          itemTotal += cartItem.price * cartItem.quantity;
        });
        const deliveryAmount = amount > 0 ? deliveryCharges : 0;
        return (itemTotal + deliveryAmount).toFixed(2);
        // return itemTotal.toFixed(2);
      },
    [deliveryCharges, cart]
  );

  const taxCalculation = useMemo(
    () => () => {
      const tax = restaurantData ? +restaurantData.tax : 0;
      if (tax === 0) {
        return tax.toFixed(2);
      }
      const amount = +calculatePrice();
      const taxAmount = ((amount / 100) * tax).toFixed(2);
      return taxAmount;
    },
    [calculatePrice, restaurantData]
  );

  const calculateTotal = useMemo(
    () => () => {
      let total = 0;
      total += +calculatePrice(deliveryCharges);
      total += +taxCalculation();
      // total += +configuration.minimumDeliveryFee;
      return parseFloat(total).toFixed(2);
    },
    // configuration.minimumDeliveryFee
    [calculatePrice, taxCalculation, configuration.minimumDeliveryFee]
  );

  return (
    <Fragment>
      {/* <Hidden lgUp> */}
      <RouterLink
        to={loadingTax ? "#" : "/checkout"}
        style={{ textDecoration: "none" }}
      >
        <Box
          style={{
            background: theme.palette.common.white,
            position: "fixed",
            bottom: 0,
            width: "100%",
            // padding: `${theme.spacing(2)} 0px`,
            borderRadius: "inherit",
          }}
        >
          {loadingTax || loadingData || loading ? (
            <CircularProgress color="secondary" size={25} />
          ) : (
            <>
              {/* <Container
                maxWidth="xl"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="caption"
                  align="left"
                  className={clsx(classes.mobileCartText, classes.whiteText)}
                >
                  {cartCount}
                </Typography>
                <Typography
                  style={{
                    ...theme.typography.body2,
                    color: theme.palette.common.white,
                    fontWeight: 700,
                  }}
                >
                  VIEW CART
                </Typography>
                <Typography
                  variant="body2"
                  align="right"
                  className={clsx(classes.mobileCartText, classes.whiteText)}
                >
                  {`${configuration.currencySymbol} ${calculateTotal()}`}
                </Typography>
              </Container> */}

              <Container
                maxWidth="xl"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box display="flex" alignItems="center" style={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems={"center"}>
                    <Typography
                      style={{
                        fontWeight: 700,
                        color: theme.palette.text.secondary,
                        fontSize: "0.975rem",
                      }}
                    >
                      {`${configuration.currencySymbol} ${calculateTotal()}`}
                    </Typography>
                    <Typography
                      style={{
                        ...theme.typography.caption,
                        fontWeight: 700,
                        color: theme.palette.common.black,
                        padding: "5px 10px",
                        borderRadius: 5,
                        border: "1px solid theme.palette.common.black",
                        margin: "0 8px",
                      }}
                      align="left"
                    >
                      {cartCount}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} ml={2}>
                    <RouterLink
                      style={{ textDecoration: "none" }}
                      to={loadingTax ? "#" : "/checkout"}
                    >
                      <Button
                        disabled={loadingTax}
                        style={{
                          background: theme.palette.primary.main,
                          margin: theme.spacing(2, 0),
                          borderRadius: 10,
                        }}
                        className={classes.checkoutContainer}
                      >
                        <Typography
                          style={{ color: theme.palette.common.black }}
                          className={classes.checkoutText}
                        >
                          GO TO CHECKOUT
                        </Typography>
                      </Button>
                    </RouterLink>
                  </Box>
                </Box>
              </Container>
            </>
          )}
        </Box>
      </RouterLink>
      {/* </Hidden> */}
    </Fragment>
  );
}

export default React.memo(MRestaurantCart);

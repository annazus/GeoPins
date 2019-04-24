import React, { useState, useEffect, useContext } from "react";
import ReactMapGL, { NavigationControl, Marker, Popup } from "react-map-gl";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { unstable_useMediaQuery as useMediaQuery } from "@material-ui/core/useMediaQuery";
import DeleteIcon from "@material-ui/icons/DeleteTwoTone";
// import "../  mapbox-gl/dist/mapbox-gl.css";
// import "../../node_modules/mapbox-gl/dist/mapbox-gl";
import difference_in_minutes from "date-fns/difference_in_minutes";
import Context from "../Context";
import { useClient } from "../Client";
import PinIcon from "./PinIcon";
import Blog from "./Blog";
import { GET_PINS_QUERY } from "../graphql/queries";
import { DELETE_PIN_MUTATION } from "../graphql/mutations";
import {
  PIN_ADDED_SUBSCRIPTION,
  PIN_UPDATED_SUBSCRIPTION,
  PIN_DELETED_SUBSCRIPTION
} from "../graphql/subscriptions";
import { Subscription } from "react-apollo";
const INITIAL_VIEWPORT = {
  latitude: 37.7577,
  longitude: -122.4376,
  zoom: 13
};
const Map = ({ classes }) => {
  const client = useClient();
  const mobileSize = useMediaQuery("max-width:650px");
  const { dispatch, state } = useContext(Context);
  useEffect(() => {
    getPins();
  }, []);
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);
  const [userPosition, setUserPosition] = useState(null);
  useEffect(() => {
    getUserPosition();
  }, []);

  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const pinExists =
      popup && state.pins.findIndex(pin => popup._id === pin._id) > -1;
    if (!pinExists) {
      setPopup(null);
    }
  }, [state.pins.length]);
  const getPins = async () => {
    const { getPins } = await client.request(GET_PINS_QUERY);
    dispatch({
      type: "GET_PINS",
      payload: getPins
    });
  };

  const getUserPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        setViewport({ ...viewport, latitude, longitude });
        setUserPosition({ latitude, longitude });
      });
    }
  };

  const handleMapClick = ({ lngLat, leftButton }) => {
    if (leftButton) {
      if (!state.draft) {
        dispatch({ type: "CREATE_DRAFT" });
      }
      const [longitude, latitude] = lngLat;
      dispatch({
        type: "UPDATE_DRAFT_LOCATION",
        payload: { longitude, latitude }
      });
    }
  };

  const highlightNewPin = pin => {
    const isNewPin =
      difference_in_minutes(Date.now(), Number(pin.createdAt)) <= 30;
    return isNewPin ? "limegreen" : "darkblue";
  };

  const handleSelectPin = pin => {
    setPopup(pin);
    dispatch({ type: "SET_PIN", payload: pin });
  };

  const isAuthUser = () => state.currentUser._id === popup.author._id;

  const handleDeletePin = async pin => {
    const variables = { pinId: pin._id };

    await client.request(DELETE_PIN_MUTATION, variables);
    setPopup(null);
  };
  return (
    <div className={mobileSize ? classes.rootMobile : classes.root}>
      <ReactMapGL
        width="100vw"
        height="calc(100vh - 64px)"
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxApiAccessToken="pk.eyJ1Ijoia21zdXphbm5hIiwiYSI6ImNqdXEweXFoNTB2bXA0ZG50OXBycHp5eW4ifQ.8U3-9XxnQDQLvu_MXLeX7g"
        {...viewport}
        onViewportChange={newViewport => {
          setViewport(newViewport);
        }}
        onClick={handleMapClick}
        scrollZoom={!mobileSize}
      >
        {userPosition && (
          <Marker
            latitude={userPosition.latitude}
            longitude={userPosition.longitude}
            offsetLeft={-20}
            offsetTop={-37}
          >
            <PinIcon color="#FF0000" size={40} />
          </Marker>
        )}

        {state.draft && (
          <Marker
            latitude={state.draft.latitude}
            longitude={state.draft.longitude}
            offsetLeft={-20}
            offsetTop={-37}
          >
            <PinIcon color="hotpink" size={40} />
          </Marker>
        )}
        {state.pins.map(pin => (
          <Marker
            key={pin._id}
            latitude={pin.latitude}
            longitude={pin.longitude}
            offsetLeft={-20}
            offsetTop={-37}
          >
            <PinIcon
              color={highlightNewPin(pin)}
              size={40}
              onClick={() => {
                handleSelectPin(pin);
              }}
            />
          </Marker>
        ))}

        {popup && (
          <Popup
            anchor="top"
            latitude={popup.latitude}
            longitude={popup.longitude}
            closeOnClick={false}
            onClose={() => setPopup(null)}
          >
            <img
              className={classes.popupImage}
              src={popup.image}
              alt={popup.title}
            />
            <div className={classes.popupTab}>
              <Typography>
                {popup.latitude.toFixed(6)},{popup.longitude.toFixed(6)}
              </Typography>
              {isAuthUser() && (
                <Button onClick={() => handleDeletePin(popup)}>
                  <DeleteIcon className={classes.DeleteIcon} />
                </Button>
              )}
            </div>
          </Popup>
        )}
      </ReactMapGL>

      <Subscription
        subscription={PIN_ADDED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinAdded } = subscriptionData.data;
          console.log({ pinAdded });
          dispatch({ type: "CREATE_PIN", payload: pinAdded });
        }}
      />

      <Subscription
        subscription={PIN_UPDATED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinUpdated } = subscriptionData.data;
          dispatch({
            type: "CREATE_COMMENT",
            payload: pinUpdated
          });
        }}
      />
      <Subscription
        subscription={PIN_DELETED_SUBSCRIPTION}
        onSubscriptionData={({ subscriptionData }) => {
          const { pinDeleted } = subscriptionData.data;
          dispatch({ type: "DELETE_PIN", payload: pinDeleted });
        }}
      />
      {/*Blog area to add pin content*/}
      <Blog />
    </div>
  );
};

const styles = {
  root: {
    display: "flex"
  },
  rootMobile: {
    display: "flex",
    flexDirection: "column-reverse"
  },
  navigationControl: {
    position: "absolute",
    top: 0,
    left: 0,
    margin: "1em"
  },
  deleteIcon: {
    color: "red"
  },
  popupImage: {
    padding: "0.4em",
    height: 200,
    width: 200,
    objectFit: "cover"
  },
  popupTab: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column"
  }
};

export default withStyles(styles)(Map);

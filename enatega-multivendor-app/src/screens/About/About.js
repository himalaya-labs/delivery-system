import React, { useContext, useEffect, useState } from 'react'
import { View, StatusBar } from 'react-native'
import {
  AntDesign,
  MaterialIcons,
  MaterialCommunityIcons
} from '@expo/vector-icons'
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps'
import { scale } from '../../utils/scaling'
import ImageHeader from '../../components/About/Header'
import styles from './styles'
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context'
import TextDefault from '../../components/Text/TextDefault/TextDefault'
import ThemeContext from '../../ui/ThemeContext/ThemeContext'
import { theme } from '../../utils/themeColors'
import { alignment } from '../../utils/alignment'
import { aboutMapStyle } from '../../utils/aboutMapStyle'
import CustomMarker from '../../assets/SVG/restaurant-marker'
import analytics from '../../utils/analytics'
import { ScrollView } from 'react-native-gesture-handler'
import { useTranslation } from 'react-i18next'
import ConfigurationContext from '../../context/Configuration'
import { colors } from '../../utils/colors'

function About(props) {
  const Analytics = analytics()
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const isArabic = language === 'ar'

  const { restaurantObject } = props.route.params

  const themeContext = useContext(ThemeContext)
  const currentTheme = theme[themeContext.ThemeValue]
  const configuration = useContext(ConfigurationContext)
  const RestAbout = {
    name: restaurantObject?.name,
    address: restaurantObject?.address,
    deliveryTime: restaurantObject?.deliveryTime,
    rating: restaurantObject?.rating,
    average: restaurantObject?.average,
    map: {
      latitude: restaurantObject?.latitude
        ? Number(restaurantObject?.latitude)
        : null,
      longitude: restaurantObject?.longitude
        ? Number(restaurantObject?.longitude)
        : null,
      latitudeDelta: 0.5,
      longitudeDelta: 0.4
    }
  }
  useEffect(() => {
    async function Track() {
      await Analytics.track(Analytics.events.NAVIGATE_TO_ABOUT)
    }
    Track()
  }, [])

  const inset = useSafeAreaInsets()
  return (
    <SafeAreaView style={styles(currentTheme).safeAreaViewStyles}>
      <StatusBar backgroundColor={colors.primary} barStyle={'light-content'} />
      <ScrollView
        style={[
          // { marginTop: inset.top },
          styles().flex,
          { backgroundColor: currentTheme.headerMenuBackground }
        ]}
      >
        <ImageHeader
          iconColor={currentTheme.newIconColor}
          svgNameL='leftArrow'
          restaurantImage={restaurantObject?.restaurantImage}
          restaurantName={restaurantObject?.restaurantName}
          deliveryTime={restaurantObject?.deliveryTime}
          total={restaurantObject?.total}
          rating={
            restaurantObject?.reviews && restaurantObject?.reviews?.length
              ? restaurantObject?.reviews[0].rating
              : 0
          }
        />
        <View style={styles(currentTheme).mapContainer}>
          <MapView
            style={styles().flex}
            scrollEnabled={false}
            zoomEnabled={true}
            zoomControlEnabled={true}
            rotateEnabled={false}
            cacheEnabled={false}
            initialRegion={RestAbout?.map}
            customMapStyle={aboutMapStyle}
            provider={PROVIDER_GOOGLE}
            maxZoomLevel={20}
            camera={{
              center: RestAbout?.map,
              zoom: 20, // Direct zoom level (0-20)
              heading: 0, // Rotation
              pitch: 0, // Tilt
              altitude: 1000 // Altitude in meters
            }}
          ></MapView>
          <View style={styles().marker}>
            <CustomMarker
              width={80}
              height={80}
              transform={[{ translateY: -20 }]}
              translateY={-20}
            />
          </View>
        </View>

        <View style={[styles().flex, styles(currentTheme).mainContainer]}>
          <View
            style={{
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: 4
            }}
          >
            <TextDefault H4 textColor={currentTheme.fontThirdColor} bolder>
              {restaurantObject?.restaurantName} |
            </TextDefault>
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 4
              }}
            >
              <MaterialIcons
                name='location-on'
                size={24}
                color={currentTheme.fontThirdColor}
              />
              <TextDefault H5 bolder textColor={currentTheme.fontThirdColor}>
                {RestAbout?.address}
              </TextDefault>
            </View>
          </View>
          <View style={{ marginTop: scale(10) }}>
            {/* {!props.loading && (
              <View
                style={{
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <AntDesign
                  name='isv'
                  size={20}
                  color={currentTheme.fontThirdColor}
                />
                <TextDefault H5 textColor={currentTheme.fontThirdColor} bold>
                  {t('minimumOrder')} {configuration.currencySymbol}
                  {restaurantObject?.restaurantMinOrder}
                </TextDefault>
              </View>
            )} */}
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: scale(8)
              }}
            >
              <MaterialIcons
                name='timer'
                size={20}
                color={currentTheme.fontThirdColor}
              />
              <TextDefault H5 textColor={currentTheme.fontThirdColor} bold>
                {t('delivery')} {restaurantObject?.deliveryTime} {t('Min')}
              </TextDefault>
            </View>
            {/* <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: 4,
                marginTop: scale(8)
              }}
            >
              <AntDesign
                name='creditcard'
                size={20}
                color={currentTheme.fontThirdColor}
              />
              <TextDefault H5 textColor={currentTheme.fontThirdColor} bold>
                {t('salesTax')} {configuration.currencySymbol}
                {restaurantObject?.restaurantTax}
              </TextDefault>
            </View> */}
            <View
              style={[
                styles().ratingContainer,
                {
                  flexDirection: isArabic ? 'row-reverse' : 'row'
                }
              ]}
            >
              <MaterialCommunityIcons
                name='star-outline'
                size={24}
                color={currentTheme.fontThirdColor}
              />

              <TextDefault
                style={{ paddingLeft: 4 }}
                textColor={currentTheme.fontThirdColor}
                H5
                bolder
              >
                {restaurantObject?.average}
              </TextDefault>
              <TextDefault H5 textColor={currentTheme.fontThirdColor} bold>
                ({restaurantObject?.total})
              </TextDefault>
            </View>
          </View>

          <View>
            <View
              style={{
                flexDirection: isArabic ? 'row-reverse' : 'row',
                alignItems: 'center',
                marginTop: scale(8),
                gap: 4
              }}
            >
              <MaterialIcons
                name='access-time'
                size={24}
                color={currentTheme.fontThirdColor}
              />
              <TextDefault H5 textColor={currentTheme.fontThirdColor} bolder>
                {t('Openingtimes')}:
              </TextDefault>
            </View>

            <View style={styles().timingContainer}>
              {restaurantObject?.openingTimes?.map((v, index) => (
                <View
                  key={index}
                  style={[
                    styles(currentTheme).timingRow,
                    {
                      flexDirection: isArabic ? 'row-reverse' : 'row'
                    }
                  ]}
                >
                  <TextDefault
                    style={styles().timingText}
                    textColor={currentTheme.black}
                    bolder
                    large
                  >
                    {t(v.day)}{' '}
                  </TextDefault>
                  {v.times?.length < 1 ? (
                    <TextDefault key={index + 8} small bold center>
                      {t('ClosedAllDay')}
                    </TextDefault>
                  ) : (
                    v.times?.map((t) => (
                      <TextDefault
                        key={index + 8}
                        textColor={currentTheme.black}
                        large
                      >
                        {t.startTime[0]}:{t.startTime[1]}
                        {' - '}
                        {t.endTime[0]}:{t.endTime[1]}
                      </TextDefault>
                    ))
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
export default About

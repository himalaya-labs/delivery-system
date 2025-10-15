import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  Platform
} from 'react-native'
import { Spinner } from '../../components'
import { colors } from '../../utilities'
import styles from './styles'
import { Image } from 'react-native-elements'
import { TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import i18next from '../../../i18n'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTranslation } from 'react-i18next'
import { AntDesign } from '@expo/vector-icons'

const { height } = Dimensions.get('window')
export default function SelectLanguage() {
  const { t } = useTranslation()
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [loader, setLoader] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigation = useNavigation()
  const languageTypes = [
    { value: 'English', code: 'en', index: 0 },
    { value: 'عربي', code: 'ar', index: 1 }
    // { value: 'français', code: 'fr', index: 2 },
    // { value: 'ភាសាខ្មែរ', code: 'km', index: 3 },
    // { value: '中文', code: 'zh', index: 4 },
    // { value: 'Deutsche', code: 'de', index: 5 },
    // { value: 'swedish', code: 'sv', index: 6 }
  ]

  const changeLanguage = async language => {
    setLoader(true)
    setSelectedLanguage(language)
    await i18next.reloadResources(language, null)
    i18next.changeLanguage(language)
    await AsyncStorage.setItem('enatega-language', language)
    // var lang = await AsyncStorage.getItem('enatega-language')
    // console.log(lang)
    setLoader(false)
    navigation.navigate('Orders')
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          height: Platform.OS === 'ios' ? height * 1.0 : height * 1.05
          // position: 'relative'
        }}>
        <View style={{ flex: 1, backgroundColor: colors.white }}>
          <View style={styles.topContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                position: 'absolute',
                top: 50,
                left: 15
              }}>
              <AntDesign name="arrowleft" size={30} />
            </TouchableOpacity>
            <View>
              <Image
                source={require('../../assets/Header.png')}
                PlaceholderContent={<ActivityIndicator />}
                style={{ width: 150, height: 140 }}
              />
            </View>
          </View>
          <View style={styles.lowerContainer}>
            <View style={styles.innerContainer}>
              {loader ? <Spinner style={{ marginTop: 60 }} /> : null}
              <Text
                style={{ ...styles.headingText, marginTop: loader ? 15 : 0 }}>
                {t('selectLanguage')}
              </Text>
              {languageTypes.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => changeLanguage(item.code)}
                  style={styles.languageButton}>
                  <Text style={styles.languageText}>{item.value}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View
              style={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                flex: 0.2
              }}>
              <View style={styles.goBackContainer}></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

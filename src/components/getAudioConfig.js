import { Platform } from 'react-native';
import { Audio } from 'expo-av';

export const getAudioConfig = (isHighQuality = true) => {
  if (Platform.OS === 'ios') {
    return {
      ios: {
        extension: '.m4a',
        outputFormat: isHighQuality ? 
          Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC : 
          Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEAR_PCM,
        audioQuality: isHighQuality ? 
          Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX :
          Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
        sampleRate: isHighQuality ? 44100 : 22050,
        numberOfChannels: 2,
        bitRate: isHighQuality ? 128000 : 64000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      android: {
        extension: '.m4a',
        outputFormat: isHighQuality ? 
          Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4 : 
          Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
        audioEncoder: isHighQuality ? 
          Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC : 
          Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: isHighQuality ? 44100 : 22050,
        numberOfChannels: 2,
        bitRate: isHighQuality ? 128000 : 64000,
      },
    };
  } else if (Platform.OS === 'android') {
    return {
      android: {
        extension: '.m4a',
        outputFormat: isHighQuality ? 
          Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4 : 
          Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_AAC_ADTS,
        audioEncoder: isHighQuality ? 
          Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC : 
          Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: isHighQuality ? 44100 : 22050,
        numberOfChannels: 2,
        bitRate: isHighQuality ? 128000 : 64000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: isHighQuality ? 
          Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC : 
          Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEAR_PCM,
        audioQuality: isHighQuality ? 
          Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX :
          Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
        sampleRate: isHighQuality ? 44100 : 22050,
        numberOfChannels: 2,
        bitRate: isHighQuality ? 128000 : 64000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    };
  } else {
    // Web platform or others
    return Audio.RecordingOptionsPresets.HIGH_QUALITY;
  }
};
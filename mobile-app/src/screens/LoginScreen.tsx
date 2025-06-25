import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../contexts/AuthContext';
import {apiService} from '../services/apiService';
import {RootStackParamList} from '../App';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);

  const {login, token} = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(username, password);
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim()) {
      Alert.alert('Error', 'Please enter a session code');
      return;
    }

    if (!token) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsJoiningSession(true);
    try {
      navigation.navigate('Controller', {sessionCode: sessionCode.trim()});
    } catch (error) {
      Alert.alert('Error', 'Failed to join session');
    } finally {
      setIsJoiningSession(false);
    }
  };

  const handleCreateSession = async () => {
    if (!token) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    try {
      const response = await apiService.createSession(token);
      navigation.navigate('Controller', {sessionCode: response.sessionCode});
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Remote Control Mobile</Text>
          <Text style={styles.subtitle}>Control devices remotely from your mobile</Text>
        </View>

        {!token ? (
          <View style={styles.loginSection}>
            <Text style={styles.sectionTitle}>Login</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              <Text style={styles.buttonText}>
                {isLoggingIn ? 'Logging in...' : 'Login as Controller'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sessionSection}>
            <Text style={styles.sectionTitle}>Remote Control Session</Text>
            
            <View style={styles.sessionOption}>
              <Text style={styles.optionTitle}>Join Existing Session</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit session code"
                value={sessionCode}
                onChangeText={setSessionCode}
                maxLength={6}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleJoinSession}
                disabled={isJoiningSession}
              >
                <Text style={styles.buttonText}>
                  {isJoiningSession ? 'Joining...' : 'Join Session'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>OR</Text>
            </View>

            <View style={styles.sessionOption}>
              <Text style={styles.optionTitle}>Create New Session</Text>
              <Text style={styles.optionDescription}>
                Create a new session and get a code to share with the device you want to control
              </Text>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleCreateSession}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Create Session
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  loginSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
  sessionOption: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  divider: {
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    backgroundColor: 'white',
    paddingHorizontal: 16,
  },
});

export default LoginScreen;

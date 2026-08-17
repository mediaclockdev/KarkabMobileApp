import React, { Component, ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      hasError: false,
    }
  }

  static getDerivedStateFromError(_: Error): State {
    return {
      hasError: true,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.log('App Crash:', error)
    console.log('Error Info:', errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong.</Text>
        </View>
      )
    }

    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
  },
})

export default ErrorBoundary
import React from 'react'
import { View, Text, Switch, ScrollView } from 'react-native'
import { BleManager } from 'react-native-ble-plx'

const styles = {
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
    marginBottom: 16,
  },
  bluetoothState: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  switch: {
    alignItems: 'center',
  },
  device: {
    padding: 16,
    fontSize: 12,
    color: 'gray',
  },
  scrollView: {
    marginBottom: 150,
  },
}

export class App extends React.Component {
  manager = new BleManager({
    restoreStateIdentifier: 'coronow',
    restoreStateFunction: this.handleRestoreState,
  })

  state = {
    bluetoothState: null,
    isScanning: false,
    devices: {},
  }

  componentDidMount() {
    this.initialize()
  }

  isReady = () => this.state.bluetoothState === 'PoweredOn'

  initialize = () => {
    this.manager.onStateChange((bluetoothState) => {
      this.setState({ bluetoothState })
    }, true)
  }

  handleRestoreState = (bluetoothState) => {
    this.setState({ bluetoothState })
  }

  startDeviceScan() {
    this.setState({ isScanning: true }, () => {
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          return
        }
        this.setDevice(this.normalizeDevice(device))
      })
    })
  }

  stopDeviceScan() {
    this.setState({ isScanning: false }, () => {
      this.manager.stopDeviceScan()
    })
  }

  setDevice = (device) => {
    this.setState((state) => ({
      devices: {
        ...state.devices,
        [device.id]: device,
      },
    }))
  }

  normalizeDevice = (data) => ({
    id: data.id,
    connectionQuality: this.displayConnectionQuality(data.rssi),
    rssi: data.rssi,
    isConnectable: data.isConnectable,
    localName: data.localName,
    manufacturerData: data.manufacturerData,
    mtu: data.mtu,
    name: data.name,
    overflowServiceUUIDs: data.overflowServiceUUIDs,
    serviceData: data.serviceData,
    serviceUUIDs: data.serviceUUIDs,
    solicitedServiceUUIDs: data.solicitedServiceUUIDs,
    txPowerLevel: data.txPowerLevel,
  })

  // http://www.veris.com/docs/whitePaper/vwp18_RSSI_RevA.pdf
  displayConnectionQuality = (rssi) => {
    if (rssi > -40) {
      return 'Exceptional'
    }
    if (rssi > -55) {
      return 'Very Good'
    }
    if (rssi > -70) {
      return 'Good'
    }
    if (rssi > -80) {
      return 'Marginal'
    }
    return 'Intermittent to No Operation'
  }

  toggleScanning = () => {
    if (this.state.isScanning) {
      this.stopDeviceScan()
    } else {
      this.startDeviceScan()
    }
  }

  render() {
    const { bluetoothState, devices, isScanning } = this.state
    return (
      <View>
        <Text style={styles.title}>CoroNOW BLE ReactNative PoC</Text>
        <Text style={styles.bluetoothState}>BLE state: {bluetoothState}</Text>
        {this.isReady() ? (
          <View style={styles.switch}>
            <Switch onValueChange={this.toggleScanning} value={isScanning} />
          </View>
        ) : null}
        <ScrollView style={styles.scrollView}>
          {Object.values(devices).map((device) => (
            <Text style={styles.device} key={device.id}>
              {JSON.stringify(device, null, 2)}
            </Text>
          ))}
        </ScrollView>
      </View>
    )
  }
}

# Casa Cirrus IPsec 

## Documentation

 * [UniFi Site-to-Site VPN](https://help.ui.com/hc/en-us/articles/7983431932439-UniFi-Gateway-Site-to-Site-IPsec-VPN-with-Third-Party-Gateways-Advanced)
 * [AWS Site-to-Site VPN Tunnel Options](https://docs.aws.amazon.com/vpn/latest/s2svpn/VPNTunnels.html)

## IPsec Configuration

Key Exchange: IKEv2

Phase 1 (IKE)
 * Encryption: AES-256
 * Integrity: SHA2-384
 * DH Group: 20 (384-bit ECP)

Phase 2 (ESP)

 * Encryption: AES-256
 * Integrity: SHA2-384
 * DH Group: 20 (384-bit ECP)

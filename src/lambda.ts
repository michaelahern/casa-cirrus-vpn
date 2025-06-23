import { EC2 } from '@aws-sdk/client-ec2';
import { promises as dns } from 'dns';

export const handler = async () => {
    const CASA_GLOBAL: Record<string, string> = {
        65001: 'gateway.canyaa.casa',
        65020: 'gateway.mobilia.casa'
    };

    const ec2 = new EC2();
    const gateways = await ec2.describeCustomerGateways();

    gateways.CustomerGateways?.forEach(async (gateway) => {
        if (!gateway.BgpAsn || !gateway.IpAddress || !gateway.CustomerGatewayId) {
            return;
        }

        if (gateway.BgpAsn in CASA_GLOBAL && gateway.State === 'available') {
            const casaHostname = CASA_GLOBAL[gateway.BgpAsn];
            console.log(`[${casaHostname}] ${gateway.CustomerGatewayId}-->${gateway.IpAddress}`);

            const casaIpAddress = await dns.resolve4(casaHostname);
            if (casaIpAddress[0] === gateway.IpAddress) {
                console.log(`[${casaHostname}] IP Address Same!`);
                return;
            }

            const gatewayNew = await ec2.createCustomerGateway({
                BgpAsn: Number(gateway.BgpAsn),
                Type: 'ipsec.1',
                TagSpecifications: [{
                    ResourceType: 'customer-gateway',
                    Tags: [{
                        Key: 'Name',
                        Value: casaHostname
                    }]
                }],
                IpAddress: casaIpAddress[0]
            });

            const vpnConnections = await ec2.describeVpnConnections();
            const vpnConnectionToUpdate = vpnConnections.VpnConnections?.find(vpn =>
                vpn.CustomerGatewayId === gateway.CustomerGatewayId
            );

            await ec2.modifyVpnConnection({
                VpnConnectionId: vpnConnectionToUpdate?.CustomerGatewayId,
                CustomerGatewayId: gatewayNew.CustomerGateway?.CustomerGatewayId
            });
        }
    });
};

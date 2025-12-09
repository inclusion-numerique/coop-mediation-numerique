import { InstanceIp } from '@app/scaleway/instance-ip'
import { InstanceSecurityGroup } from '@app/scaleway/instance-security-group'
import { InstanceServer } from '@app/scaleway/instance-server'
import { TerraformOutput } from 'cdktf'
import { Construct } from 'constructs'

const MAILDEV_WEB_PORT = 1080
const MAILDEV_SMTP_PORT = 1025
const MAILDEV_VOLUME = '/home/scaleway/maildev'

export class MaildevInstance extends Construct {
  public readonly webUrl: TerraformOutput
  public readonly smtp: TerraformOutput

  constructor(scope: Construct, id: string) {
    super(scope, id)

    const publicIp = new InstanceIp(this, 'maildevPublicIp', {})

    const sg = new InstanceSecurityGroup(this, 'maildevSecurityGroup', {
      name: 'maildev-security-group',
      inboundDefaultPolicy: 'drop',
      outboundDefaultPolicy: 'accept',

      inboundRule: [
        { action: 'accept', port: MAILDEV_WEB_PORT },
        { action: 'accept', port: MAILDEV_SMTP_PORT },
        { action: 'accept', port: 22 },
      ],
    })

    new InstanceServer(this, 'maildevServer', {
      name: 'maildev',
      type: 'STARDUST1-S',
      image: 'docker',
      ipId: publicIp.id,
      securityGroupId: sg.id,
      userData: {
        'cloud-init': `#cloud-config
runcmd:
  - mkdir -p ${MAILDEV_VOLUME}
  - chown 1000:1000 ${MAILDEV_VOLUME}
  - docker run -d --restart always --name maildev -p ${MAILDEV_WEB_PORT}:${MAILDEV_WEB_PORT} -p ${MAILDEV_SMTP_PORT}:${MAILDEV_SMTP_PORT} -v ${MAILDEV_VOLUME}:/maildev maildev/maildev:latest
`,
      },
    })

    this.webUrl = new TerraformOutput(this, 'maildevWebUrl', {
      value: `http://${publicIp.address}:${MAILDEV_WEB_PORT}`,
    })

    this.smtp = new TerraformOutput(this, 'maildevSmtp', {
      value: `${publicIp.address}:${MAILDEV_SMTP_PORT}`,
    })
  }

  getMaildevWebUrl() {
    return this.webUrl.value as string
  }

  getMaildevSmtp() {
    return this.smtp.value as string
  }
}

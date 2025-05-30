// https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataScalewayVpcPublicGatewayIpConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip#id DataScalewayVpcPublicGatewayIp#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * The ID of the IP
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip#ip_id DataScalewayVpcPublicGatewayIp#ip_id}
  */
  readonly ipId?: string;
}

/**
* Represents a {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip scaleway_vpc_public_gateway_ip}
*/
export class DataScalewayVpcPublicGatewayIp extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "scaleway_vpc_public_gateway_ip";

  // ==============
  // STATIC Methods
  // ==============
  /**
  * Generates CDKTF code for importing a DataScalewayVpcPublicGatewayIp resource upon running "cdktf plan <stack-name>"
  * @param scope The scope in which to define this construct
  * @param importToId The construct id used in the generated config for the DataScalewayVpcPublicGatewayIp to import
  * @param importFromId The id of the existing DataScalewayVpcPublicGatewayIp that should be imported. Refer to the {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip#import import section} in the documentation of this resource for the id to use
  * @param provider? Optional instance of the provider where the DataScalewayVpcPublicGatewayIp to import is found
  */
  public static generateConfigForImport(scope: Construct, importToId: string, importFromId: string, provider?: cdktf.TerraformProvider) {
        return new cdktf.ImportableResource(scope, importToId, { terraformResourceType: "scaleway_vpc_public_gateway_ip", importId: importFromId, provider });
      }

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/vpc_public_gateway_ip scaleway_vpc_public_gateway_ip} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataScalewayVpcPublicGatewayIpConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DataScalewayVpcPublicGatewayIpConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'scaleway_vpc_public_gateway_ip',
      terraformGeneratorMetadata: {
        providerName: 'scaleway',
        providerVersion: '2.53.0',
        providerVersionConstraint: '>= 2.53.0'
      },
      provider: config.provider,
      dependsOn: config.dependsOn,
      count: config.count,
      lifecycle: config.lifecycle,
      provisioners: config.provisioners,
      connection: config.connection,
      forEach: config.forEach
    });
    this._id = config.id;
    this._ipId = config.ipId;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // address - computed: true, optional: false, required: false
  public get address() {
    return this.getStringAttribute('address');
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // id - computed: true, optional: true, required: false
  private _id?: string; 
  public get id() {
    return this.getStringAttribute('id');
  }
  public set id(value: string) {
    this._id = value;
  }
  public resetId() {
    this._id = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get idInput() {
    return this._id;
  }

  // ip_id - computed: false, optional: true, required: false
  private _ipId?: string; 
  public get ipId() {
    return this.getStringAttribute('ip_id');
  }
  public set ipId(value: string) {
    this._ipId = value;
  }
  public resetIpId() {
    this._ipId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get ipIdInput() {
    return this._ipId;
  }

  // organization_id - computed: true, optional: false, required: false
  public get organizationId() {
    return this.getStringAttribute('organization_id');
  }

  // project_id - computed: true, optional: false, required: false
  public get projectId() {
    return this.getStringAttribute('project_id');
  }

  // reverse - computed: true, optional: false, required: false
  public get reverse() {
    return this.getStringAttribute('reverse');
  }

  // tags - computed: true, optional: false, required: false
  public get tags() {
    return this.getListAttribute('tags');
  }

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }

  // zone - computed: true, optional: false, required: false
  public get zone() {
    return this.getStringAttribute('zone');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      ip_id: cdktf.stringToTerraform(this._ipId),
    };
  }

  protected synthesizeHclAttributes(): { [name: string]: any } {
    const attrs = {
      id: {
        value: cdktf.stringToHclTerraform(this._id),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      ip_id: {
        value: cdktf.stringToHclTerraform(this._ipId),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
    };

    // remove undefined attributes
    return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined && value.value !== undefined ))
  }
}

// https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface DataScalewayIotDeviceConfig extends cdktf.TerraformMetaArguments {
  /**
  * The ID of the IOT Device
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#device_id DataScalewayIotDevice#device_id}
  */
  readonly deviceId?: string;
  /**
  * The ID of the hub on which this device will be created
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#hub_id DataScalewayIotDevice#hub_id}
  */
  readonly hubId?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#id DataScalewayIotDevice#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * The name of the device
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#name DataScalewayIotDevice#name}
  */
  readonly name?: string;
  /**
  * The region you want to attach the resource to
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#region DataScalewayIotDevice#region}
  */
  readonly region?: string;
}
export interface DataScalewayIotDeviceCertificate {
}

export function dataScalewayIotDeviceCertificateToTerraform(struct?: DataScalewayIotDeviceCertificate): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}


export function dataScalewayIotDeviceCertificateToHclTerraform(struct?: DataScalewayIotDeviceCertificate): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
  };
  return attrs;
}

export class DataScalewayIotDeviceCertificateOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataScalewayIotDeviceCertificate | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataScalewayIotDeviceCertificate | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // crt - computed: true, optional: false, required: false
  public get crt() {
    return this.getStringAttribute('crt');
  }

  // key - computed: true, optional: false, required: false
  public get key() {
    return this.getStringAttribute('key');
  }
}

export class DataScalewayIotDeviceCertificateList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataScalewayIotDeviceCertificateOutputReference {
    return new DataScalewayIotDeviceCertificateOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataScalewayIotDeviceMessageFiltersPublish {
}

export function dataScalewayIotDeviceMessageFiltersPublishToTerraform(struct?: DataScalewayIotDeviceMessageFiltersPublish): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}


export function dataScalewayIotDeviceMessageFiltersPublishToHclTerraform(struct?: DataScalewayIotDeviceMessageFiltersPublish): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
  };
  return attrs;
}

export class DataScalewayIotDeviceMessageFiltersPublishOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataScalewayIotDeviceMessageFiltersPublish | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataScalewayIotDeviceMessageFiltersPublish | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // policy - computed: true, optional: false, required: false
  public get policy() {
    return this.getStringAttribute('policy');
  }

  // topics - computed: true, optional: false, required: false
  public get topics() {
    return this.getListAttribute('topics');
  }
}

export class DataScalewayIotDeviceMessageFiltersPublishList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataScalewayIotDeviceMessageFiltersPublishOutputReference {
    return new DataScalewayIotDeviceMessageFiltersPublishOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataScalewayIotDeviceMessageFiltersSubscribe {
}

export function dataScalewayIotDeviceMessageFiltersSubscribeToTerraform(struct?: DataScalewayIotDeviceMessageFiltersSubscribe): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}


export function dataScalewayIotDeviceMessageFiltersSubscribeToHclTerraform(struct?: DataScalewayIotDeviceMessageFiltersSubscribe): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
  };
  return attrs;
}

export class DataScalewayIotDeviceMessageFiltersSubscribeOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataScalewayIotDeviceMessageFiltersSubscribe | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataScalewayIotDeviceMessageFiltersSubscribe | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // policy - computed: true, optional: false, required: false
  public get policy() {
    return this.getStringAttribute('policy');
  }

  // topics - computed: true, optional: false, required: false
  public get topics() {
    return this.getListAttribute('topics');
  }
}

export class DataScalewayIotDeviceMessageFiltersSubscribeList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataScalewayIotDeviceMessageFiltersSubscribeOutputReference {
    return new DataScalewayIotDeviceMessageFiltersSubscribeOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}
export interface DataScalewayIotDeviceMessageFilters {
}

export function dataScalewayIotDeviceMessageFiltersToTerraform(struct?: DataScalewayIotDeviceMessageFilters): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
  }
}


export function dataScalewayIotDeviceMessageFiltersToHclTerraform(struct?: DataScalewayIotDeviceMessageFilters): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
  };
  return attrs;
}

export class DataScalewayIotDeviceMessageFiltersOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param complexObjectIndex the index of this item in the list
  * @param complexObjectIsFromSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string, complexObjectIndex: number, complexObjectIsFromSet: boolean) {
    super(terraformResource, terraformAttribute, complexObjectIsFromSet, complexObjectIndex);
  }

  public get internalValue(): DataScalewayIotDeviceMessageFilters | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: DataScalewayIotDeviceMessageFilters | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
    }
  }

  // publish - computed: true, optional: false, required: false
  private _publish = new DataScalewayIotDeviceMessageFiltersPublishList(this, "publish", false);
  public get publish() {
    return this._publish;
  }

  // subscribe - computed: true, optional: false, required: false
  private _subscribe = new DataScalewayIotDeviceMessageFiltersSubscribeList(this, "subscribe", false);
  public get subscribe() {
    return this._subscribe;
  }
}

export class DataScalewayIotDeviceMessageFiltersList extends cdktf.ComplexList {

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  * @param wrapsSet whether the list is wrapping a set (will add tolist() to be able to access an item via an index)
  */
  constructor(protected terraformResource: cdktf.IInterpolatingParent, protected terraformAttribute: string, protected wrapsSet: boolean) {
    super(terraformResource, terraformAttribute, wrapsSet)
  }

  /**
  * @param index the index of the item to return
  */
  public get(index: number): DataScalewayIotDeviceMessageFiltersOutputReference {
    return new DataScalewayIotDeviceMessageFiltersOutputReference(this.terraformResource, this.terraformAttribute, index, this.wrapsSet);
  }
}

/**
* Represents a {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device scaleway_iot_device}
*/
export class DataScalewayIotDevice extends cdktf.TerraformDataSource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "scaleway_iot_device";

  // ==============
  // STATIC Methods
  // ==============
  /**
  * Generates CDKTF code for importing a DataScalewayIotDevice resource upon running "cdktf plan <stack-name>"
  * @param scope The scope in which to define this construct
  * @param importToId The construct id used in the generated config for the DataScalewayIotDevice to import
  * @param importFromId The id of the existing DataScalewayIotDevice that should be imported. Refer to the {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device#import import section} in the documentation of this resource for the id to use
  * @param provider? Optional instance of the provider where the DataScalewayIotDevice to import is found
  */
  public static generateConfigForImport(scope: Construct, importToId: string, importFromId: string, provider?: cdktf.TerraformProvider) {
        return new cdktf.ImportableResource(scope, importToId, { terraformResourceType: "scaleway_iot_device", importId: importFromId, provider });
      }

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/data-sources/iot_device scaleway_iot_device} Data Source
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options DataScalewayIotDeviceConfig = {}
  */
  public constructor(scope: Construct, id: string, config: DataScalewayIotDeviceConfig = {}) {
    super(scope, id, {
      terraformResourceType: 'scaleway_iot_device',
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
    this._deviceId = config.deviceId;
    this._hubId = config.hubId;
    this._id = config.id;
    this._name = config.name;
    this._region = config.region;
  }

  // ==========
  // ATTRIBUTES
  // ==========

  // allow_insecure - computed: true, optional: false, required: false
  public get allowInsecure() {
    return this.getBooleanAttribute('allow_insecure');
  }

  // allow_multiple_connections - computed: true, optional: false, required: false
  public get allowMultipleConnections() {
    return this.getBooleanAttribute('allow_multiple_connections');
  }

  // certificate - computed: true, optional: false, required: false
  private _certificate = new DataScalewayIotDeviceCertificateList(this, "certificate", false);
  public get certificate() {
    return this._certificate;
  }

  // created_at - computed: true, optional: false, required: false
  public get createdAt() {
    return this.getStringAttribute('created_at');
  }

  // description - computed: true, optional: false, required: false
  public get description() {
    return this.getStringAttribute('description');
  }

  // device_id - computed: false, optional: true, required: false
  private _deviceId?: string; 
  public get deviceId() {
    return this.getStringAttribute('device_id');
  }
  public set deviceId(value: string) {
    this._deviceId = value;
  }
  public resetDeviceId() {
    this._deviceId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deviceIdInput() {
    return this._deviceId;
  }

  // hub_id - computed: true, optional: true, required: false
  private _hubId?: string; 
  public get hubId() {
    return this.getStringAttribute('hub_id');
  }
  public set hubId(value: string) {
    this._hubId = value;
  }
  public resetHubId() {
    this._hubId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get hubIdInput() {
    return this._hubId;
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

  // is_connected - computed: true, optional: false, required: false
  public get isConnected() {
    return this.getBooleanAttribute('is_connected');
  }

  // last_activity_at - computed: true, optional: false, required: false
  public get lastActivityAt() {
    return this.getStringAttribute('last_activity_at');
  }

  // message_filters - computed: true, optional: false, required: false
  private _messageFilters = new DataScalewayIotDeviceMessageFiltersList(this, "message_filters", false);
  public get messageFilters() {
    return this._messageFilters;
  }

  // name - computed: false, optional: true, required: false
  private _name?: string; 
  public get name() {
    return this.getStringAttribute('name');
  }
  public set name(value: string) {
    this._name = value;
  }
  public resetName() {
    this._name = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // region - computed: false, optional: true, required: false
  private _region?: string; 
  public get region() {
    return this.getStringAttribute('region');
  }
  public set region(value: string) {
    this._region = value;
  }
  public resetRegion() {
    this._region = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get regionInput() {
    return this._region;
  }

  // status - computed: true, optional: false, required: false
  public get status() {
    return this.getStringAttribute('status');
  }

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      device_id: cdktf.stringToTerraform(this._deviceId),
      hub_id: cdktf.stringToTerraform(this._hubId),
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      region: cdktf.stringToTerraform(this._region),
    };
  }

  protected synthesizeHclAttributes(): { [name: string]: any } {
    const attrs = {
      device_id: {
        value: cdktf.stringToHclTerraform(this._deviceId),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      hub_id: {
        value: cdktf.stringToHclTerraform(this._hubId),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      id: {
        value: cdktf.stringToHclTerraform(this._id),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      name: {
        value: cdktf.stringToHclTerraform(this._name),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      region: {
        value: cdktf.stringToHclTerraform(this._region),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
    };

    // remove undefined attributes
    return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined && value.value !== undefined ))
  }
}

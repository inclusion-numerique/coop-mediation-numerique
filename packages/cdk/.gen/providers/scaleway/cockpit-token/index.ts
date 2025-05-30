// https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token
// generated from terraform resource schema

import { Construct } from 'constructs';
import * as cdktf from 'cdktf';

// Configuration

export interface CockpitTokenConfig extends cdktf.TerraformMetaArguments {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#id CockpitToken#id}
  *
  * Please be aware that the id field is automatically added to all resources in Terraform providers using a Terraform provider SDK version below 2.
  * If you experience problems setting this value it might not be settable. Please take a look at the provider documentation to ensure it should be settable.
  */
  readonly id?: string;
  /**
  * The name of the token
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#name CockpitToken#name}
  */
  readonly name: string;
  /**
  * The project_id you want to attach the resource to
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#project_id CockpitToken#project_id}
  */
  readonly projectId?: string;
  /**
  * The region you want to attach the resource to
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#region CockpitToken#region}
  */
  readonly region?: string;
  /**
  * scopes block
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#scopes CockpitToken#scopes}
  */
  readonly scopes?: CockpitTokenScopes;
  /**
  * timeouts block
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#timeouts CockpitToken#timeouts}
  */
  readonly timeouts?: CockpitTokenTimeouts;
}
export interface CockpitTokenScopes {
  /**
  * Query logs
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#query_logs CockpitToken#query_logs}
  */
  readonly queryLogs?: boolean | cdktf.IResolvable;
  /**
  * Query metrics
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#query_metrics CockpitToken#query_metrics}
  */
  readonly queryMetrics?: boolean | cdktf.IResolvable;
  /**
  * Query traces
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#query_traces CockpitToken#query_traces}
  */
  readonly queryTraces?: boolean | cdktf.IResolvable;
  /**
  * Setup alerts
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#setup_alerts CockpitToken#setup_alerts}
  */
  readonly setupAlerts?: boolean | cdktf.IResolvable;
  /**
  * Setup logs rules
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#setup_logs_rules CockpitToken#setup_logs_rules}
  */
  readonly setupLogsRules?: boolean | cdktf.IResolvable;
  /**
  * Setup metrics rules
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#setup_metrics_rules CockpitToken#setup_metrics_rules}
  */
  readonly setupMetricsRules?: boolean | cdktf.IResolvable;
  /**
  * Write logs
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#write_logs CockpitToken#write_logs}
  */
  readonly writeLogs?: boolean | cdktf.IResolvable;
  /**
  * Write metrics
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#write_metrics CockpitToken#write_metrics}
  */
  readonly writeMetrics?: boolean | cdktf.IResolvable;
  /**
  * Write traces
  *
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#write_traces CockpitToken#write_traces}
  */
  readonly writeTraces?: boolean | cdktf.IResolvable;
}

export function cockpitTokenScopesToTerraform(struct?: CockpitTokenScopesOutputReference | CockpitTokenScopes): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    query_logs: cdktf.booleanToTerraform(struct!.queryLogs),
    query_metrics: cdktf.booleanToTerraform(struct!.queryMetrics),
    query_traces: cdktf.booleanToTerraform(struct!.queryTraces),
    setup_alerts: cdktf.booleanToTerraform(struct!.setupAlerts),
    setup_logs_rules: cdktf.booleanToTerraform(struct!.setupLogsRules),
    setup_metrics_rules: cdktf.booleanToTerraform(struct!.setupMetricsRules),
    write_logs: cdktf.booleanToTerraform(struct!.writeLogs),
    write_metrics: cdktf.booleanToTerraform(struct!.writeMetrics),
    write_traces: cdktf.booleanToTerraform(struct!.writeTraces),
  }
}


export function cockpitTokenScopesToHclTerraform(struct?: CockpitTokenScopesOutputReference | CockpitTokenScopes): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
    query_logs: {
      value: cdktf.booleanToHclTerraform(struct!.queryLogs),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    query_metrics: {
      value: cdktf.booleanToHclTerraform(struct!.queryMetrics),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    query_traces: {
      value: cdktf.booleanToHclTerraform(struct!.queryTraces),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    setup_alerts: {
      value: cdktf.booleanToHclTerraform(struct!.setupAlerts),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    setup_logs_rules: {
      value: cdktf.booleanToHclTerraform(struct!.setupLogsRules),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    setup_metrics_rules: {
      value: cdktf.booleanToHclTerraform(struct!.setupMetricsRules),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    write_logs: {
      value: cdktf.booleanToHclTerraform(struct!.writeLogs),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    write_metrics: {
      value: cdktf.booleanToHclTerraform(struct!.writeMetrics),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
    write_traces: {
      value: cdktf.booleanToHclTerraform(struct!.writeTraces),
      isBlock: false,
      type: "simple",
      storageClassType: "boolean",
    },
  };

  // remove undefined attributes
  return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined && value.value !== undefined));
}

export class CockpitTokenScopesOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false, 0);
  }

  public get internalValue(): CockpitTokenScopes | undefined {
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._queryLogs !== undefined) {
      hasAnyValues = true;
      internalValueResult.queryLogs = this._queryLogs;
    }
    if (this._queryMetrics !== undefined) {
      hasAnyValues = true;
      internalValueResult.queryMetrics = this._queryMetrics;
    }
    if (this._queryTraces !== undefined) {
      hasAnyValues = true;
      internalValueResult.queryTraces = this._queryTraces;
    }
    if (this._setupAlerts !== undefined) {
      hasAnyValues = true;
      internalValueResult.setupAlerts = this._setupAlerts;
    }
    if (this._setupLogsRules !== undefined) {
      hasAnyValues = true;
      internalValueResult.setupLogsRules = this._setupLogsRules;
    }
    if (this._setupMetricsRules !== undefined) {
      hasAnyValues = true;
      internalValueResult.setupMetricsRules = this._setupMetricsRules;
    }
    if (this._writeLogs !== undefined) {
      hasAnyValues = true;
      internalValueResult.writeLogs = this._writeLogs;
    }
    if (this._writeMetrics !== undefined) {
      hasAnyValues = true;
      internalValueResult.writeMetrics = this._writeMetrics;
    }
    if (this._writeTraces !== undefined) {
      hasAnyValues = true;
      internalValueResult.writeTraces = this._writeTraces;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: CockpitTokenScopes | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this._queryLogs = undefined;
      this._queryMetrics = undefined;
      this._queryTraces = undefined;
      this._setupAlerts = undefined;
      this._setupLogsRules = undefined;
      this._setupMetricsRules = undefined;
      this._writeLogs = undefined;
      this._writeMetrics = undefined;
      this._writeTraces = undefined;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this._queryLogs = value.queryLogs;
      this._queryMetrics = value.queryMetrics;
      this._queryTraces = value.queryTraces;
      this._setupAlerts = value.setupAlerts;
      this._setupLogsRules = value.setupLogsRules;
      this._setupMetricsRules = value.setupMetricsRules;
      this._writeLogs = value.writeLogs;
      this._writeMetrics = value.writeMetrics;
      this._writeTraces = value.writeTraces;
    }
  }

  // query_logs - computed: false, optional: true, required: false
  private _queryLogs?: boolean | cdktf.IResolvable; 
  public get queryLogs() {
    return this.getBooleanAttribute('query_logs');
  }
  public set queryLogs(value: boolean | cdktf.IResolvable) {
    this._queryLogs = value;
  }
  public resetQueryLogs() {
    this._queryLogs = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get queryLogsInput() {
    return this._queryLogs;
  }

  // query_metrics - computed: false, optional: true, required: false
  private _queryMetrics?: boolean | cdktf.IResolvable; 
  public get queryMetrics() {
    return this.getBooleanAttribute('query_metrics');
  }
  public set queryMetrics(value: boolean | cdktf.IResolvable) {
    this._queryMetrics = value;
  }
  public resetQueryMetrics() {
    this._queryMetrics = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get queryMetricsInput() {
    return this._queryMetrics;
  }

  // query_traces - computed: false, optional: true, required: false
  private _queryTraces?: boolean | cdktf.IResolvable; 
  public get queryTraces() {
    return this.getBooleanAttribute('query_traces');
  }
  public set queryTraces(value: boolean | cdktf.IResolvable) {
    this._queryTraces = value;
  }
  public resetQueryTraces() {
    this._queryTraces = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get queryTracesInput() {
    return this._queryTraces;
  }

  // setup_alerts - computed: false, optional: true, required: false
  private _setupAlerts?: boolean | cdktf.IResolvable; 
  public get setupAlerts() {
    return this.getBooleanAttribute('setup_alerts');
  }
  public set setupAlerts(value: boolean | cdktf.IResolvable) {
    this._setupAlerts = value;
  }
  public resetSetupAlerts() {
    this._setupAlerts = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get setupAlertsInput() {
    return this._setupAlerts;
  }

  // setup_logs_rules - computed: false, optional: true, required: false
  private _setupLogsRules?: boolean | cdktf.IResolvable; 
  public get setupLogsRules() {
    return this.getBooleanAttribute('setup_logs_rules');
  }
  public set setupLogsRules(value: boolean | cdktf.IResolvable) {
    this._setupLogsRules = value;
  }
  public resetSetupLogsRules() {
    this._setupLogsRules = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get setupLogsRulesInput() {
    return this._setupLogsRules;
  }

  // setup_metrics_rules - computed: false, optional: true, required: false
  private _setupMetricsRules?: boolean | cdktf.IResolvable; 
  public get setupMetricsRules() {
    return this.getBooleanAttribute('setup_metrics_rules');
  }
  public set setupMetricsRules(value: boolean | cdktf.IResolvable) {
    this._setupMetricsRules = value;
  }
  public resetSetupMetricsRules() {
    this._setupMetricsRules = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get setupMetricsRulesInput() {
    return this._setupMetricsRules;
  }

  // write_logs - computed: false, optional: true, required: false
  private _writeLogs?: boolean | cdktf.IResolvable; 
  public get writeLogs() {
    return this.getBooleanAttribute('write_logs');
  }
  public set writeLogs(value: boolean | cdktf.IResolvable) {
    this._writeLogs = value;
  }
  public resetWriteLogs() {
    this._writeLogs = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get writeLogsInput() {
    return this._writeLogs;
  }

  // write_metrics - computed: false, optional: true, required: false
  private _writeMetrics?: boolean | cdktf.IResolvable; 
  public get writeMetrics() {
    return this.getBooleanAttribute('write_metrics');
  }
  public set writeMetrics(value: boolean | cdktf.IResolvable) {
    this._writeMetrics = value;
  }
  public resetWriteMetrics() {
    this._writeMetrics = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get writeMetricsInput() {
    return this._writeMetrics;
  }

  // write_traces - computed: false, optional: true, required: false
  private _writeTraces?: boolean | cdktf.IResolvable; 
  public get writeTraces() {
    return this.getBooleanAttribute('write_traces');
  }
  public set writeTraces(value: boolean | cdktf.IResolvable) {
    this._writeTraces = value;
  }
  public resetWriteTraces() {
    this._writeTraces = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get writeTracesInput() {
    return this._writeTraces;
  }
}
export interface CockpitTokenTimeouts {
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#create CockpitToken#create}
  */
  readonly create?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#default CockpitToken#default}
  */
  readonly default?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#delete CockpitToken#delete}
  */
  readonly delete?: string;
  /**
  * Docs at Terraform Registry: {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#read CockpitToken#read}
  */
  readonly read?: string;
}

export function cockpitTokenTimeoutsToTerraform(struct?: CockpitTokenTimeouts | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  return {
    create: cdktf.stringToTerraform(struct!.create),
    default: cdktf.stringToTerraform(struct!.default),
    delete: cdktf.stringToTerraform(struct!.delete),
    read: cdktf.stringToTerraform(struct!.read),
  }
}


export function cockpitTokenTimeoutsToHclTerraform(struct?: CockpitTokenTimeouts | cdktf.IResolvable): any {
  if (!cdktf.canInspect(struct) || cdktf.Tokenization.isResolvable(struct)) { return struct; }
  if (cdktf.isComplexElement(struct)) {
    throw new Error("A complex element was used as configuration, this is not supported: https://cdk.tf/complex-object-as-configuration");
  }
  const attrs = {
    create: {
      value: cdktf.stringToHclTerraform(struct!.create),
      isBlock: false,
      type: "simple",
      storageClassType: "string",
    },
    default: {
      value: cdktf.stringToHclTerraform(struct!.default),
      isBlock: false,
      type: "simple",
      storageClassType: "string",
    },
    delete: {
      value: cdktf.stringToHclTerraform(struct!.delete),
      isBlock: false,
      type: "simple",
      storageClassType: "string",
    },
    read: {
      value: cdktf.stringToHclTerraform(struct!.read),
      isBlock: false,
      type: "simple",
      storageClassType: "string",
    },
  };

  // remove undefined attributes
  return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined && value.value !== undefined));
}

export class CockpitTokenTimeoutsOutputReference extends cdktf.ComplexObject {
  private isEmptyObject = false;
  private resolvableValue?: cdktf.IResolvable;

  /**
  * @param terraformResource The parent resource
  * @param terraformAttribute The attribute on the parent resource this class is referencing
  */
  public constructor(terraformResource: cdktf.IInterpolatingParent, terraformAttribute: string) {
    super(terraformResource, terraformAttribute, false);
  }

  public get internalValue(): CockpitTokenTimeouts | cdktf.IResolvable | undefined {
    if (this.resolvableValue) {
      return this.resolvableValue;
    }
    let hasAnyValues = this.isEmptyObject;
    const internalValueResult: any = {};
    if (this._create !== undefined) {
      hasAnyValues = true;
      internalValueResult.create = this._create;
    }
    if (this._default !== undefined) {
      hasAnyValues = true;
      internalValueResult.default = this._default;
    }
    if (this._delete !== undefined) {
      hasAnyValues = true;
      internalValueResult.delete = this._delete;
    }
    if (this._read !== undefined) {
      hasAnyValues = true;
      internalValueResult.read = this._read;
    }
    return hasAnyValues ? internalValueResult : undefined;
  }

  public set internalValue(value: CockpitTokenTimeouts | cdktf.IResolvable | undefined) {
    if (value === undefined) {
      this.isEmptyObject = false;
      this.resolvableValue = undefined;
      this._create = undefined;
      this._default = undefined;
      this._delete = undefined;
      this._read = undefined;
    }
    else if (cdktf.Tokenization.isResolvable(value)) {
      this.isEmptyObject = false;
      this.resolvableValue = value;
    }
    else {
      this.isEmptyObject = Object.keys(value).length === 0;
      this.resolvableValue = undefined;
      this._create = value.create;
      this._default = value.default;
      this._delete = value.delete;
      this._read = value.read;
    }
  }

  // create - computed: false, optional: true, required: false
  private _create?: string; 
  public get create() {
    return this.getStringAttribute('create');
  }
  public set create(value: string) {
    this._create = value;
  }
  public resetCreate() {
    this._create = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get createInput() {
    return this._create;
  }

  // default - computed: false, optional: true, required: false
  private _default?: string; 
  public get default() {
    return this.getStringAttribute('default');
  }
  public set default(value: string) {
    this._default = value;
  }
  public resetDefault() {
    this._default = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get defaultInput() {
    return this._default;
  }

  // delete - computed: false, optional: true, required: false
  private _delete?: string; 
  public get delete() {
    return this.getStringAttribute('delete');
  }
  public set delete(value: string) {
    this._delete = value;
  }
  public resetDelete() {
    this._delete = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get deleteInput() {
    return this._delete;
  }

  // read - computed: false, optional: true, required: false
  private _read?: string; 
  public get read() {
    return this.getStringAttribute('read');
  }
  public set read(value: string) {
    this._read = value;
  }
  public resetRead() {
    this._read = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get readInput() {
    return this._read;
  }
}

/**
* Represents a {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token scaleway_cockpit_token}
*/
export class CockpitToken extends cdktf.TerraformResource {

  // =================
  // STATIC PROPERTIES
  // =================
  public static readonly tfResourceType = "scaleway_cockpit_token";

  // ==============
  // STATIC Methods
  // ==============
  /**
  * Generates CDKTF code for importing a CockpitToken resource upon running "cdktf plan <stack-name>"
  * @param scope The scope in which to define this construct
  * @param importToId The construct id used in the generated config for the CockpitToken to import
  * @param importFromId The id of the existing CockpitToken that should be imported. Refer to the {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token#import import section} in the documentation of this resource for the id to use
  * @param provider? Optional instance of the provider where the CockpitToken to import is found
  */
  public static generateConfigForImport(scope: Construct, importToId: string, importFromId: string, provider?: cdktf.TerraformProvider) {
        return new cdktf.ImportableResource(scope, importToId, { terraformResourceType: "scaleway_cockpit_token", importId: importFromId, provider });
      }

  // ===========
  // INITIALIZER
  // ===========

  /**
  * Create a new {@link https://registry.terraform.io/providers/scaleway/scaleway/2.53.0/docs/resources/cockpit_token scaleway_cockpit_token} Resource
  *
  * @param scope The scope in which to define this construct
  * @param id The scoped construct ID. Must be unique amongst siblings in the same scope
  * @param options CockpitTokenConfig
  */
  public constructor(scope: Construct, id: string, config: CockpitTokenConfig) {
    super(scope, id, {
      terraformResourceType: 'scaleway_cockpit_token',
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
    this._name = config.name;
    this._projectId = config.projectId;
    this._region = config.region;
    this._scopes.internalValue = config.scopes;
    this._timeouts.internalValue = config.timeouts;
  }

  // ==========
  // ATTRIBUTES
  // ==========

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

  // name - computed: false, optional: false, required: true
  private _name?: string; 
  public get name() {
    return this.getStringAttribute('name');
  }
  public set name(value: string) {
    this._name = value;
  }
  // Temporarily expose input value. Use with caution.
  public get nameInput() {
    return this._name;
  }

  // project_id - computed: true, optional: true, required: false
  private _projectId?: string; 
  public get projectId() {
    return this.getStringAttribute('project_id');
  }
  public set projectId(value: string) {
    this._projectId = value;
  }
  public resetProjectId() {
    this._projectId = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get projectIdInput() {
    return this._projectId;
  }

  // region - computed: true, optional: true, required: false
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

  // secret_key - computed: true, optional: false, required: false
  public get secretKey() {
    return this.getStringAttribute('secret_key');
  }

  // updated_at - computed: true, optional: false, required: false
  public get updatedAt() {
    return this.getStringAttribute('updated_at');
  }

  // scopes - computed: false, optional: true, required: false
  private _scopes = new CockpitTokenScopesOutputReference(this, "scopes");
  public get scopes() {
    return this._scopes;
  }
  public putScopes(value: CockpitTokenScopes) {
    this._scopes.internalValue = value;
  }
  public resetScopes() {
    this._scopes.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get scopesInput() {
    return this._scopes.internalValue;
  }

  // timeouts - computed: false, optional: true, required: false
  private _timeouts = new CockpitTokenTimeoutsOutputReference(this, "timeouts");
  public get timeouts() {
    return this._timeouts;
  }
  public putTimeouts(value: CockpitTokenTimeouts) {
    this._timeouts.internalValue = value;
  }
  public resetTimeouts() {
    this._timeouts.internalValue = undefined;
  }
  // Temporarily expose input value. Use with caution.
  public get timeoutsInput() {
    return this._timeouts.internalValue;
  }

  // =========
  // SYNTHESIS
  // =========

  protected synthesizeAttributes(): { [name: string]: any } {
    return {
      id: cdktf.stringToTerraform(this._id),
      name: cdktf.stringToTerraform(this._name),
      project_id: cdktf.stringToTerraform(this._projectId),
      region: cdktf.stringToTerraform(this._region),
      scopes: cockpitTokenScopesToTerraform(this._scopes.internalValue),
      timeouts: cockpitTokenTimeoutsToTerraform(this._timeouts.internalValue),
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
      name: {
        value: cdktf.stringToHclTerraform(this._name),
        isBlock: false,
        type: "simple",
        storageClassType: "string",
      },
      project_id: {
        value: cdktf.stringToHclTerraform(this._projectId),
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
      scopes: {
        value: cockpitTokenScopesToHclTerraform(this._scopes.internalValue),
        isBlock: true,
        type: "list",
        storageClassType: "CockpitTokenScopesList",
      },
      timeouts: {
        value: cockpitTokenTimeoutsToHclTerraform(this._timeouts.internalValue),
        isBlock: true,
        type: "struct",
        storageClassType: "CockpitTokenTimeouts",
      },
    };

    // remove undefined attributes
    return Object.fromEntries(Object.entries(attrs).filter(([_, value]) => value !== undefined && value.value !== undefined ))
  }
}

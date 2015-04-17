Ext.namespace("GeoExt.tree");GeoExt.tree.LayerNodeUI=Ext.extend(Ext.tree.TreeNodeUI,{radio:null,constructor:function(config){GeoExt.tree.LayerNodeUI.superclass.constructor.apply(this,arguments);},render:function(bulkRender){GeoExt.tree.LayerNodeUI.superclass.render.call(this,bulkRender);var a=this.node.attributes;if(a.radioGroup&&this.radio!==undefined){this.radio=Ext.DomHelper.insertAfter(this.checkbox,['<input type="radio" class="x-tree-node-radio" name="',a.radioGroup,'_radio"></input>'].join(""));}},onClick:function(e){if(e.getTarget('input[type=radio]',1)){this.fireEvent("radiochange",this.node);}else{GeoExt.tree.LayerNodeUI.superclass.onClick.call(this,e);}},toggleCheck:function(value){GeoExt.tree.LayerNodeUI.superclass.toggleCheck.call(this,value);var node=this.node;var layer=this.node.layer;node.visibilityChanging=true;if(this.checkbox&&(layer.getVisibility()!=this.isChecked())){layer.setVisibility(this.isChecked());}
node.visibilityChanging=false;},onDestroy:function(){delete this.radio;GeoExt.tree.LayerNodeUI.superclass.onDestroy.call(this);}});GeoExt.tree.LayerNode=Ext.extend(Ext.tree.TreeNode,{layer:null,layerStore:null,childNodeType:null,visibilityChanging:false,constructor:function(config){config.leaf=config.leaf||!config.children;config.iconCls=typeof config.iconCls=="undefined"&&!config.children?"layer-icon":config.iconCls;config.checked=false;this.defaultUI=this.defaultUI||GeoExt.tree.LayerNodeUI;this.addEvents("radiochange");Ext.apply(this,{layer:config.layer,layerStore:config.layerStore,childNodeType:config.childNodeType});GeoExt.tree.LayerNode.superclass.constructor.apply(this,arguments);},render:function(bulkRender){var layer=this.layer instanceof OpenLayers.Layer&&this.layer;if(!layer){if(!this.layerStore||this.layerStore=="auto"){this.layerStore=GeoExt.MapPanel.guess().layers;}
var i=this.layerStore.findBy(function(o){return o.get("title")==this.layer;},this);if(i!=-1){layer=this.layerStore.getAt(i).get("layer");}}
if(!this.rendered||!layer){var ui=this.getUI();if(layer){this.layer=layer;if(!this.text){this.text=layer.name;}
if(this.childNodeType){this.addChildNodes();}
ui.show();ui.toggleCheck(layer.getVisibility());this.addVisibilityEventHandlers();this.attributes.checked=layer.getVisibility();}else{ui.hide();}
if(this.layerStore instanceof GeoExt.data.LayerStore){this.addStoreEventHandlers(layer);}}
GeoExt.tree.LayerNode.superclass.render.call(this,bulkRender);},addVisibilityEventHandlers:function(){this.layer.events.register("visibilitychanged",this,function(){if(!this.visibilityChanging&&this.attributes.checked!=this.layer.getVisibility()){this.getUI().toggleCheck(this.layer.getVisibility());}});this.on({"checkchange":function(node,checked){if(checked&&this.layer.isBaseLayer&&this.layer.map){this.layer.map.setBaseLayer(this.layer);}
this.layer.setVisibility(checked);},scope:this});},addStoreEventHandlers:function(){this.layerStore.on({"add":function(store,records,index){var l;for(var i=0;i<records.length;++i){l=records[i].get("layer");if(this.layer==l){this.getUI().show();}else if(this.layer==l.name){this.render(bulkRender);return;}}},"remove":function(store,record,index){if(this.layer==record.get("layer")){this.getUI().hide();}},scope:this});},addChildNodes:function(){if(typeof this.childNodeType=="string"){Ext.tree.TreePanel.nodeTypes[this.childNodeType].add(this);}else if(typeof this.childNodeType.add==="function"){this.childNodeType.add(this);}}});Ext.tree.TreePanel.nodeTypes.gx_layer=GeoExt.tree.LayerNode;Ext.namespace("GeoExt.tree");GeoExt.tree.LayerContainer=Ext.extend(Ext.tree.TreeNode,{layerStore:null,defaults:null,constructor:function(config){this.layerStore=config.layerStore;this.defaults=config.defaults;GeoExt.tree.LayerContainer.superclass.constructor.apply(this,arguments);},render:function(bulkRender){if(!this.rendered){if(!this.layerStore){this.layerStore=GeoExt.MapPanel.guess().layers;}
this.layerStore.each(function(record){this.addLayerNode(record);},this);this.layerStore.on({"add":this.onStoreAdd,"remove":this.onStoreRemove,scope:this});}
GeoExt.tree.LayerContainer.superclass.render.call(this,bulkRender);},onStoreAdd:function(store,records,index){if(!this._reordering){var nodeIndex=this.recordIndexToNodeIndex(index);for(var i=0;i<records.length;++i){this.addLayerNode(records[i],nodeIndex);}}},onStoreRemove:function(store,record,index){if(!this._reordering){this.removeLayerNode(record);}},onDestroy:function(){if(this.layerStore){this.layerStore.un("add",this.onStoreAdd,this);this.layerStore.un("remove",this.onStoreRemove,this);}
GeoExt.tree.LayerContainer.superclass.onDestroy.apply(this,arguments);},recordIndexToNodeIndex:function(index){var store=this.layerStore;var count=store.getCount();var nodeIndex=-1;for(var i=count-1;i>=0;--i){if(store.getAt(i).get("layer").displayInLayerSwitcher){++nodeIndex;if(index===i){break;}}};return nodeIndex;},nodeIndexToRecordIndex:function(index){var store=this.layerStore;var count=store.getCount();var nodeIndex=-1;for(var i=count-1;i>=0;--i){if(store.getAt(i).get("layer").displayInLayerSwitcher){++nodeIndex;if(index===nodeIndex){break;}}}
return i;},addLayerNode:function(layerRecord,index){index=index||0;var layer=layerRecord.get("layer");if(layer.displayInLayerSwitcher===true){var node=new GeoExt.tree.LayerNode(Ext.applyIf({iconCls:layer.isBayeLayer?'baselayer-icon':'layer-icon',layer:layer,layerStore:this.layerStore},this.defaults));var sibling=this.item(index);if(sibling){this.insertBefore(node,sibling);}else{this.appendChild(node);}
node.on("move",this.onChildMove,this);}},removeLayerNode:function(layerRecord){var layer=layerRecord.get("layer");if(layer.displayInLayerSwitcher==true){var node=this.findChildBy(function(node){return node.layer==layer;});if(node){node.un("move",this.onChildMove,this);node.remove();}}},onChildMove:function(tree,node,oldParent,newParent,index){if(oldParent===newParent){var newRecordIndex=this.nodeIndexToRecordIndex(index);var oldRecordIndex=this.layerStore.findBy(function(record){return record.get("layer")===node.layer;});var record=this.layerStore.getAt(oldRecordIndex);this._reordering=true;this.layerStore.remove(record);this.layerStore.insert(newRecordIndex,[record]);delete this._reordering;}}});Ext.tree.TreePanel.nodeTypes.gx_layercontainer=GeoExt.tree.LayerContainer;Ext.namespace("GeoExt.tree");GeoExt.tree.BaseLayerContainer=Ext.extend(GeoExt.tree.LayerContainer,{constructor:function(config){config.text=config.text||"Base Layer";GeoExt.tree.BaseLayerContainer.superclass.constructor.apply(this,arguments);},addLayerNode:function(layerRecord){var layer=layerRecord.get("layer");if(layer.isBaseLayer==true){GeoExt.tree.BaseLayerContainer.superclass.addLayerNode.call(this,layerRecord);}},removeLayerNode:function(layerRecord){var layer=layerRecord.get("layer");if(layer.isBaseLayer==true){GeoExt.tree.BaseLayerContainer.superclass.removeLayerNode.call(this,layerRecord);}}});Ext.tree.TreePanel.nodeTypes.gx_baselayercontainer=GeoExt.tree.BaseLayerContainer;Ext.namespace('GeoExt','GeoExt.data');GeoExt.data.FeatureReader=function(meta,recordType){meta=meta||{};if(!(recordType instanceof Function)){recordType=GeoExt.data.FeatureRecord.create(recordType||meta.fields||{});}
GeoExt.data.FeatureReader.superclass.constructor.call(this,meta,recordType);};Ext.extend(GeoExt.data.FeatureReader,Ext.data.DataReader,{totalRecords:null,read:function(response){return this.readRecords(response.features);},readRecords:function(features){var records=[];if(features){var recordType=this.recordType,fields=recordType.prototype.fields;var i,lenI,j,lenJ,feature,values,field,v;for(i=0,lenI=features.length;i<lenI;i++){feature=features[i];values={};if(feature.attributes){for(j=0,lenJ=fields.length;j<lenJ;j++){field=fields.items[j];if(/[\[\.]/.test(field.mapping)){try{v=new Function("obj","return obj."+field.mapping)(feature.attributes);}catch(e){v=field.defaultValue;}}
else{v=feature.attributes[field.mapping||field.name]||field.defaultValue;}
v=field.convert(v);values[field.name]=v;}}
values.feature=feature;values.state=feature.state;values.fid=feature.fid;records[records.length]=new recordType(values,feature.id);}}
return{records:records,totalRecords:this.totalRecords!=null?this.totalRecords:records.length};}});Ext.namespace("GeoExt.data");GeoExt.data.ScaleStore=Ext.extend(Ext.data.Store,{map:null,constructor:function(config){var map=(config.map instanceof GeoExt.MapPanel?config.map.map:config.map);delete config.map;config=Ext.applyIf(config,{reader:new Ext.data.JsonReader({},["level","resolution","scale"])});GeoExt.data.ScaleStore.superclass.constructor.call(this,config);if(map)this.bind(map);},bind:function(map,options){this.map=(map instanceof GeoExt.MapPanel?map.map:map);this.map.events.register('changebaselayer',this,this.populateFromMap);if(this.map.baseLayer){this.populateFromMap();}else{this.map.events.register('addlayer',this,this.populateOnAdd);}},unbind:function(){if(this.map){this.map.events.unregister('addlayer',this,this.populateOnAdd);this.map.events.unregister('changebaselayer',this,this.populateFromMap);delete this.map;}},populateOnAdd:function(evt){if(evt.layer.isBaseLayer){this.populateFromMap();this.map.events.unregister('addlayer',this,this.populateOnAdd);}},populateFromMap:function(){var zooms=[];for(var i=this.map.numZoomLevels-1;i>0;i--){var res=this.map.getResolutionForZoom(i);var units=this.map.baseLayer.units;var scale=OpenLayers.Util.getScaleFromResolution(res,units);zooms.push({level:i,resolution:res,scale:scale});}
this.loadData(zooms);}});Ext.namespace("GeoExt.form");GeoExt.form.filterFromForm=function(form,logicalOp){if(form instanceof Ext.form.FormPanel){form=form.getForm();}
var filters=[],values=form.getValues(false);for(var prop in values){var s=prop.split("__");var value=values[prop],type;if(s.length>1&&(type=GeoExt.form.filterFromForm.FILTER_MAP[s[1]])!==undefined){prop=s[0];}else{type=OpenLayers.Filter.Comparison.EQUAL_TO;}
filters.push(new OpenLayers.Filter.Comparison({type:type,value:value,property:prop}));}
return new OpenLayers.Filter.Logical({type:logicalOp||OpenLayers.Filter.Logical.AND,filters:filters});};GeoExt.form.filterFromForm.FILTER_MAP={"eq":OpenLayers.Filter.Comparison.EQUAL_TO,"ne":OpenLayers.Filter.Comparison.NOT_EQUAL_TO,"lt":OpenLayers.Filter.Comparison.LESS_THAN,"le":OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,"gt":OpenLayers.Filter.Comparison.GREATER_THAN,"ge":OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,"like":OpenLayers.Filter.Comparison.LIKE};GeoExt.form.SearchAction=Ext.extend(Ext.form.Action,{type:"search",response:null,constructor:function(form,options){GeoExt.form.SearchAction.superclass.constructor.call(this,form,options);},run:function(){var o=this.options;var f=GeoExt.form.filterFromForm(this.form);if(o.clientValidation===false||this.form.isValid()){this.response=o.protocol.read(Ext.applyIf({filter:f,callback:this.handleResponse,scope:this},o));}else if(o.clientValidation!==false){this.failureType=Ext.form.Action.CLIENT_INVALID;this.form.afterAction(this,false);}},handleResponse:function(response){this.response=response;if(response.success()){this.form.afterAction(this,true);}else{this.form.afterAction(this,false);}
var o=this.options;if(o.callback){o.callback.call(o.scope,response);}}});Ext.namespace("GeoExt.data");GeoExt.data.FeatureStoreMixin={layer:null,reader:null,addFeatureFilter:null,addRecordFilter:null,constructor:function(config){config=config||{};config.reader=config.reader||new GeoExt.data.FeatureReader({},config.fields);var layer=config.layer;delete config.layer;if(config.features){config.data=config.features;}
delete config.features;var options={initDir:config.initDir};delete config.initDir;arguments.callee.superclass.constructor.call(this,config);if(layer){this.bind(layer,options);}},bind:function(layer,options){if(this.layer){return;}
this.layer=layer;options=options||{};var initDir=options.initDir;if(options.initDir==undefined){initDir=GeoExt.data.FeatureStore.LAYER_TO_STORE|GeoExt.data.FeatureStore.STORE_TO_LAYER;}
var features=layer.features.slice(0);if(initDir&GeoExt.data.FeatureStore.STORE_TO_LAYER){var records=this.getRange();for(var i=records.length-1;i>=0;i--){this.layer.addFeatures([records[i].get("feature")]);}}
if(initDir&GeoExt.data.FeatureStore.LAYER_TO_STORE){this.loadData(features,true);}
layer.events.on({"featuresadded":this.onFeaturesAdded,"featuresremoved":this.onFeaturesRemoved,"featuremodified":this.onFeatureModified,scope:this});this.on({"load":this.onLoad,"clear":this.onClear,"add":this.onAdd,"remove":this.onRemove,"update":this.onUpdate,scope:this});},unbind:function(){if(this.layer){this.layer.events.un({"featuresadded":this.onFeaturesAdded,"featuresremoved":this.onFeaturesRemoved,"featuremodified":this.onFeatureModified,scope:this});this.un("load",this.onLoad,this);this.un("clear",this.onClear,this);this.un("add",this.onAdd,this);this.un("remove",this.onRemove,this);this.un("update",this.onUpdate,this);this.layer=null;}},onFeaturesAdded:function(evt){if(!this._adding){var features=evt.features,toAdd=features;if(typeof this.addFeatureFilter=="function"){toAdd=[];var i,len,feature;for(var i=0,len=features.length;i<len;i++){feature=features[i];if(this.addFeatureFilter(feature)!==false){toAdd.push(feature);}}}
this._adding=true;this.loadData(toAdd,true);delete this._adding;}},onFeaturesRemoved:function(evt){if(!this._removing){var features=evt.features,feature,record,i;for(i=features.length-1;i>=0;i--){feature=features[i];record=this.getById(feature.id);if(record!==undefined){this._removing=true;this.remove(record);delete this._removing;}}}},onFeatureModified:function(evt){if(!this._updating){var feature=evt.feature;var record=this.getById(feature.id);if(record!==undefined){record.beginEdit();attributes=feature.attributes;if(attributes){var fields=this.recordType.prototype.fields;for(var i=0,len=fields.length;i<len;i++){var field=fields.items[i];var v=attributes[field.mapping||field.name]||field.defaultValue;v=field.convert(v);record.set(field.name,v);}}
record.set("state",feature.state);record.set("fid",feature.fid);record.set("feature",feature);this._updating=true;record.endEdit();delete this._updating;}}},addFeaturesToLayer:function(records){var i,len,features,record;if(typeof this.addRecordFilter=="function"){features=[]
for(i=0,len=records.length;i<len;i++){record=records[i];if(this.addRecordFilter(record)!==false){features.push(record.get("feature"));}}}else{features=new Array((len=records.length));for(i=0;i<len;i++){features[i]=records[i].get("feature");}}
if(features.length>0){this._adding=true;this.layer.addFeatures(features);delete this._adding;}},onLoad:function(store,records,options){if(!options||options.add!==true){this._removing=true;this.layer.removeFeatures(this.layer.features);delete this._removing;this.addFeaturesToLayer(records);}},onClear:function(store){this._removing=true;this.layer.removeFeatures(this.layer.features);delete this._removing;},onAdd:function(store,records,index){if(!this._adding){this.addFeaturesToLayer(records);}},onRemove:function(store,record,index){if(!this._removing){var feature=record.get("feature");if(this.layer.getFeatureById(feature.id)!=null){this._removing=true;this.layer.removeFeatures([record.get("feature")]);delete this._removing;}}},onUpdate:function(store,record,operation){if(!this._updating){var feature=record.get("feature");if(record.fields){var cont=this.layer.events.triggerEvent("beforefeaturemodified",{feature:feature});if(cont!==false){record.fields.each(function(field){feature.attributes[field.mapping||field.name]=record.get(field.name);});this._updating=true;this.layer.events.triggerEvent("featuremodified",{feature:feature});delete this._updating;if(this.layer.getFeatureById(feature.id)!=null){this.layer.drawFeature(feature);}}}}}};GeoExt.data.FeatureStore=Ext.extend(Ext.data.Store,GeoExt.data.FeatureStoreMixin);GeoExt.data.FeatureStore.LAYER_TO_STORE=1;GeoExt.data.FeatureStore.STORE_TO_LAYER=2;Ext.namespace("GeoExt.data");GeoExt.data.FeatureRecord=Ext.data.Record.create([{name:"feature"},{name:"state"},{name:"fid"}]);GeoExt.data.FeatureRecord.create=function(o){var f=Ext.extend(GeoExt.data.FeatureRecord,{});var p=f.prototype;p.fields=new Ext.util.MixedCollection(false,function(field){return field.name;});GeoExt.data.FeatureRecord.prototype.fields.each(function(f){p.fields.add(f);});if(o){for(var i=0,len=o.length;i<len;i++){p.fields.add(new Ext.data.Field(o[i]));}}
f.getField=function(name){return p.fields.get(name);};return f;};Ext.namespace("GeoExt");GeoExt.MapPanel=Ext.extend(Ext.Panel,{map:null,layers:null,center:null,zoom:null,extent:null,initComponent:function(){if(!(this.map instanceof OpenLayers.Map)){this.map=new OpenLayers.Map(Ext.applyIf(this.map||{},{allOverlays:true}));}
if(typeof this.center=="string"){this.center=OpenLayers.LonLat.fromString(this.center);}else if(this.center instanceof Array){this.center=new OpenLayers.LonLat(this.center[0],this.center[1]);}
if(typeof this.extent=="string"){this.extent=OpenLayers.Bounds.fromString(this.extent);}else if(this.extent instanceof Array){this.extent=OpenLayers.Bounds.fromArray(this.extent);}
GeoExt.MapPanel.superclass.initComponent.call(this);},updateMapSize:function(){if(this.map){this.map.updateSize();}},initMap:function(){this.map.render(this.body.dom);var layers=this.layers;if(!layers||layers instanceof Array){this.layers=new GeoExt.data.LayerStore({layers:layers,map:this.map});}
if(this.map.layers.length>0){if(this.center||this.zoom!=null){this.map.setCenter(this.center,this.zoom);}else if(this.extent){this.map.zoomToExtent(this.extent);}else{this.map.zoomToMaxExtent();}}},afterRender:function(){GeoExt.MapPanel.superclass.afterRender.apply(this,arguments);if(!this.ownerCt){this.initMap();}else{this.ownerCt.on("move",this.updateMapSize,this);this.ownerCt.on({"afterlayout":{fn:this.initMap,scope:this,single:true}});}},onResize:function(){GeoExt.MapPanel.superclass.onResize.apply(this,arguments);this.updateMapSize();},onDestroy:function(){if(this.ownerCt){this.ownerCt.un("move",this.updateMapSize,this);}
GeoExt.MapPanel.superclass.onDestroy.apply(this,arguments);}});GeoExt.MapPanel.guess=function(){return Ext.ComponentMgr.all.find(function(o){return o instanceof GeoExt.MapPanel;});};Ext.reg('gx_mappanel',GeoExt.MapPanel);Ext.namespace("GeoExt.data");GeoExt.data.LayerRecord=Ext.data.Record.create([{name:"layer"},{name:"title",type:"string",mapping:"name"}]);GeoExt.data.LayerRecord.create=function(o){var f=Ext.extend(GeoExt.data.LayerRecord,{});var p=f.prototype;p.fields=new Ext.util.MixedCollection(false,function(field){return field.name;});GeoExt.data.LayerRecord.prototype.fields.each(function(f){p.fields.add(f);});if(o){for(var i=0,len=o.length;i<len;i++){p.fields.add(new Ext.data.Field(o[i]));}}
f.getField=function(name){return p.fields.get(name);};return f;};Ext.namespace("GeoExt.data");GeoExt.data.WMSCapabilitiesReader=function(meta,recordType){meta=meta||{};if(!meta.format){meta.format=new OpenLayers.Format.WMSCapabilities();}
if(!(typeof recordType==="function")){recordType=GeoExt.data.LayerRecord.create(recordType||meta.fields||[{name:"name",type:"string"},{name:"abstract",type:"string"},{name:"queryable",type:"boolean"},{name:"formats"},{name:"styles"},{name:"llbbox"},{name:"minScale"},{name:"maxScale"},{name:"prefix"}]);}
GeoExt.data.WMSCapabilitiesReader.superclass.constructor.call(this,meta,recordType);};Ext.extend(GeoExt.data.WMSCapabilitiesReader,Ext.data.DataReader,{read:function(request){var data=request.responseXML;if(!data||!data.documentElement){data=request.responseText;}
return this.readRecords(data);},readRecords:function(data){if(typeof data==="string"||data.nodeType){data=this.meta.format.read(data);}
var url=data.capability.request.getmap.href;var records=[],layer;for(var i=0,len=data.capability.layers.length;i<len;i++){layer=data.capability.layers[i];if(layer.name){records.push(new this.recordType(Ext.apply(layer,{layer:new OpenLayers.Layer.WMS(layer.title||layer.name,url,{layers:layer.name})})));}}
return{totalRecords:records.length,success:true,records:records};}});Ext.namespace("GeoExt.data");GeoExt.data.LayerStoreMixin={map:null,reader:null,constructor:function(config){config=config||{};config.reader=config.reader||new GeoExt.data.LayerReader({},config.fields);delete config.fields;var map=config.map instanceof GeoExt.MapPanel?config.map.map:config.map;delete config.map;if(config.layers){config.data=config.layers;}
delete config.layers;var options={initDir:config.initDir};delete config.initDir;arguments.callee.superclass.constructor.call(this,config);if(map){this.bind(map,options);}},bind:function(map,options){if(this.map){return;}
this.map=map;options=options||{};var initDir=options.initDir;if(options.initDir==undefined){initDir=GeoExt.data.LayerStore.MAP_TO_STORE|GeoExt.data.LayerStore.STORE_TO_MAP;}
var layers=map.layers.slice(0);if(initDir&GeoExt.data.LayerStore.STORE_TO_MAP){var records=this.getRange();for(var i=records.length-1;i>=0;i--){this.map.addLayer(records[i].get("layer"));}}
if(initDir&GeoExt.data.LayerStore.MAP_TO_STORE){this.loadData(layers,true);}
map.events.on({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.on({"load":this.onLoad,"clear":this.onClear,"add":this.onAdd,"remove":this.onRemove,scope:this});this.data.on({"replace":this.onReplace,scope:this});},unbind:function(){if(this.map){this.map.events.un({"changelayer":this.onChangeLayer,"addlayer":this.onAddLayer,"removelayer":this.onRemoveLayer,scope:this});this.un("load",this.onLoad,this);this.un("clear",this.onClear,this);this.un("add",this.onAdd,this);this.un("remove",this.onRemove,this);this.data.un("replace",this.onReplace,this);this.map=null;}},onChangeLayer:function(evt){var layer=evt.layer;if(evt.property==="order"){if(!this._adding&&!this._removing){var layerIndex=this.map.getLayerIndex(layer);var recordIndex=this.findBy(function(rec,id){return rec.get("layer")===layer;});if(recordIndex>-1){if(layerIndex!==recordIndex){var record=this.getAt(recordIndex);this._removing=true;this.remove(record);delete this._removing;this._adding=true;this.insert(layerIndex,[record]);delete this._adding;}}}}},onAddLayer:function(evt){if(!this._adding){var layer=evt.layer;this._adding=true;this.loadData([layer],true);delete this._adding;}},onRemoveLayer:function(evt){if(!this._removing){var layer=evt.layer;this._removing=true;this.remove(this.getById(layer.id));delete this._removing;}},onLoad:function(store,records,options){if(!Ext.isArray(records)){records=[records];}
if(options&&!options.add){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;var len=records.length;if(len>0){var layers=new Array(len);for(var j=0;j<len;j++){layers[j]=records[j].get("layer");}
this._adding=true;this.map.addLayers(layers);delete this._adding;}}},onClear:function(store){this._removing=true;for(var i=this.map.layers.length-1;i>=0;i--){this.map.removeLayer(this.map.layers[i]);}
delete this._removing;},onAdd:function(store,records,index){if(!this._adding){this._adding=true;var layer;for(var i=records.length-1;i>=0;--i){layer=records[i].get("layer");this.map.addLayer(layer);if(index!==this.map.layers.length-1){this.map.setLayerIndex(layer,index);}}
delete this._adding;}},onRemove:function(store,record,index){if(!this._removing){var layer=record.get("layer");if(this.map.getLayer(layer.id)!=null){this._removing=true;this.removeMapLayer(record);delete this._removing;}}},removeMapLayer:function(record){this.map.removeLayer(record.get("layer"));},onReplace:function(key,oldRecord,newRecord){this.removeMapLayer(oldRecord);}};GeoExt.data.LayerStore=Ext.extend(Ext.data.Store,GeoExt.data.LayerStoreMixin);GeoExt.data.LayerStore.MAP_TO_STORE=1;GeoExt.data.LayerStore.STORE_TO_MAP=2;Ext.namespace("GeoExt");GeoExt.Popup=Ext.extend(Ext.Window,{anchored:true,panIn:true,unpinnable:true,feature:null,lonlat:null,animCollapse:false,draggable:false,shadow:false,popupCls:"gx-popup",ancCls:null,initComponent:function(){if(!this.feature&&this.lonlat){this.feature=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(this.lonlat.lon,this.lonlat.lat));}
this.baseCls=this.popupCls+" "+this.baseCls;this.elements+=',anc';GeoExt.Popup.superclass.initComponent.call(this);},onRender:function(ct,position){GeoExt.Popup.superclass.onRender.call(this,ct,position);this.ancCls=this.popupCls+"-anc";this.createElement("anc",this.el);},initTools:function(){if(this.unpinnable){this.addTool({id:'unpin',handler:this.unanchorPopup.createDelegate(this,[])});}
GeoExt.Popup.superclass.initTools.call(this);},addToMapPanel:function(mapPanel){this.mapPanel=mapPanel;this.map=this.mapPanel.map;mapPanel.add(this);mapPanel.doLayout();this.position();if(this.anchored){this.anchorPopup();}
this.show();if(this.panIn){this.panIntoView();}},setSize:function(w,h){if(this.anc){var ancSize=this.getAnchorElement().getSize();if(typeof w=='object'){h=w.height-ancSize.height;w=w.width;}else if(!isNaN(h)){h=h-ancSize.height;}}
GeoExt.Popup.superclass.setSize.call(this,w,h);},position:function(){var centerLonLat=this.feature.geometry.getBounds().getCenterLonLat();var centerPx=this.map.getViewPortPxFromLonLat(centerLonLat);var anchorSelector="div."+this.ancCls;var dx=this.anc.down(anchorSelector).getLeft(true)+
this.anc.down(anchorSelector).getWidth()/2;var dy=this.el.getHeight();this.setPosition(centerPx.x-dx,centerPx.y-dy);},getAnchorElement:function(){var anchorSelector="div."+this.ancCls;var anc=Ext.get(this.el.child(anchorSelector));return anc;},anchorPopup:function(){this.map.events.on({"move":this.position,scope:this});this.on({"resize":this.position,"collapse":this.position,"expand":this.position,scope:this});},unanchorPopup:function(){this.unbindFromMapPanel();this.draggable=true;this.header.addClass("x-window-draggable");this.dd=new Ext.Window.DD(this);this.getAnchorElement().remove();this.anc=null;this.tools.unpin.hide();var collapsed=this.collapsed;this.mapPanel.remove(this,false);this.container=Ext.getBody();var xy=this.getPosition();this.hide();this.el.appendTo(Ext.getBody());this.setPagePosition(xy[0],xy[1]);this.show();if(collapsed){this.collapse();}},unbindFromMapPanel:function(){this.map.events.un({"move":this.position,scope:this});this.un("resize",this.position);this.un("collapse",this.position);this.un("expand",this.position);},panIntoView:function(){if(!this.anchored){return;}
this.position();var centerLonLat=this.feature.geometry.getBounds().getCenterLonLat();var centerPx=this.map.getViewPortPxFromLonLat(centerLonLat);var popupPos=this.getPosition(true);var panelSize=[this.mapPanel.getInnerWidth(),this.mapPanel.getInnerHeight()];var popupSize=this.getSize();var newPos=[popupPos[0],popupPos[1]];var padding=this.map.paddingForPopups;if(popupPos[0]<padding.left){newPos[0]=padding.left;}else if(popupPos[0]+popupSize.width>panelSize[0]-padding.right){newPos[0]=panelSize[0]-padding.right-popupSize.width;}
if(popupPos[1]<padding.top){newPos[1]=padding.top;}else if(popupPos[1]+popupSize.height>panelSize[1]-padding.bottom){newPos[1]=panelSize[1]-padding.bottom-popupSize.height;}
var dx=popupPos[0]-newPos[0];var dy=popupPos[1]-newPos[1];this.map.pan(dx,dy);},beforeDestroy:function(){this.unbindFromMapPanel();GeoExt.Popup.superclass.beforeDestroy.call(this);}});Ext.reg('gx_popup',GeoExt.Popup);Ext.namespace("GeoExt.form");GeoExt.form.FormPanel=Ext.extend(Ext.form.FormPanel,{protocol:null,createForm:function(){delete this.initialConfig.listeners;return new GeoExt.form.BasicForm(null,this.initialConfig);},search:function(options){this.getForm().search(options);}});Ext.reg("gx_formpanel",GeoExt.form.FormPanel);Ext.namespace("GeoExt","GeoExt.data");GeoExt.data.LayerReader=function(meta,recordType){meta=meta||{};if(!(recordType instanceof Function)){recordType=GeoExt.data.LayerRecord.create(recordType||meta.fields||{});}
GeoExt.data.LayerReader.superclass.constructor.call(this,meta,recordType);};Ext.extend(GeoExt.data.LayerReader,Ext.data.DataReader,{totalRecords:null,readRecords:function(layers){var records=[];if(layers){var recordType=this.recordType,fields=recordType.prototype.fields;var i,lenI,j,lenJ,layer,values,field,v;for(i=0,lenI=layers.length;i<lenI;i++){layer=layers[i];values={};for(j=0,lenJ=fields.length;j<lenJ;j++){field=fields.items[j];v=layer[field.mapping||field.name]||field.defaultValue;v=field.convert(v);values[field.name]=v;}
values.layer=layer;records[records.length]=new recordType(values,layer.id);}}
return{records:records,totalRecords:this.totalRecords!=null?this.totalRecords:records.length};}});Ext.namespace('GeoExt','GeoExt.data');GeoExt.data.ProtocolProxy=function(config){GeoExt.data.ProtocolProxy.superclass.constructor.call(this);Ext.apply(this,config);};Ext.extend(GeoExt.data.ProtocolProxy,Ext.data.DataProxy,{protocol:null,abortPrevious:true,response:null,load:function(params,reader,callback,scope,arg){if(this.fireEvent("beforeload",this,params)!==false){var o={params:params||{},request:{callback:callback,scope:scope,arg:arg},reader:reader};var cb=OpenLayers.Function.bind(this.loadResponse,this,o);if(this.abortPrevious){this.abortRequest();}
var options={params:params,callback:cb,scope:this};Ext.applyIf(options,arg);this.response=this.protocol.read(options);}else{callback.call(scope||this,null,arg,false);}},abortRequest:function(){if(this.response){var response=this.response;if(response.priv&&typeof response.priv.abort=="function"){response.priv.abort();this.response=null;}}},loadResponse:function(o,response){if(response.success()){var result=o.reader.read(response);this.fireEvent("load",this,o,o.request.arg);o.request.callback.call(o.request.scope,result,o.request.arg,true);}else{this.fireEvent("loadexception",this,o,response);o.request.callback.call(o.request.scope,null,o.request.arg,false);}}});Ext.namespace("GeoExt.form");GeoExt.form.BasicForm=Ext.extend(Ext.form.BasicForm,{protocol:null,doAction:function(action,options){if(action=="search"){options=Ext.applyIf(options||{},{protocol:this.protocol});action=new GeoExt.form.SearchAction(this,options);}
return GeoExt.form.BasicForm.superclass.doAction.call(this,action,options);},search:function(options){return this.doAction("search",options);}});Ext.namespace("GeoExt.data");GeoExt.data.WMSCapabilitiesStore=function(c){GeoExt.data.WMSCapabilitiesStore.superclass.constructor.call(this,Ext.apply(c,{proxy:c.proxy||(!c.data?new Ext.data.HttpProxy({url:c.url,disableCaching:false,method:"GET"}):undefined),reader:new GeoExt.data.WMSCapabilitiesReader(c,c.fields)}));};Ext.extend(GeoExt.data.WMSCapabilitiesStore,Ext.data.Store);Ext.namespace("GeoExt.tree");GeoExt.tree.OverlayLayerContainer=Ext.extend(GeoExt.tree.LayerContainer,{constructor:function(config){config.text=config.text||"Overlays";GeoExt.tree.OverlayLayerContainer.superclass.constructor.apply(this,arguments);},addLayerNode:function(layerRecord){var layer=layerRecord.get("layer");if(layer.isBaseLayer==false){GeoExt.tree.OverlayLayerContainer.superclass.addLayerNode.call(this,layerRecord);}},removeLayerNode:function(layerRecord){var layer=layerRecord.get("layer");if(layer.isBaseLayer==false){GeoExt.tree.OverlayLayerContainer.superclass.removeLayerNode.call(this,layerRecord);}}});Ext.tree.TreePanel.nodeTypes.gx_overlaylayercontainer=GeoExt.tree.OverlayLayerContainer;
// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQdestroyable = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQdestroyable.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		// Load properties
		this.inst.health = this.properties[0];
		this.DESTROY_TIME = this.properties[1];
		this.destroyTime = 0;
		this.destroyPhase = false;
		this.ignited = false;
		this.contaminated = false;
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		if (this.destroyPhase){
			this.destroyTime += dt;
			var ratio = this.destroyTime / this.DESTROY_TIME;
			this.inst.opacity = 1 - ratio;
			if (ratio >= 1){
				this.runtime.DestroyInstance(this.inst);
			}
		}
		else if(this.inst.health <= 0){
			this.inst.collisionsEnabled = false;
			this.destroyPhase = true;
			if (this.inst.onDestroyPhase)
				this.inst.onDestroyPhase();
			var sizeX = this.inst.tileSize[0];
			var sizeY = this.inst.tileSize[1];
			var baseX = this.inst.x - (CQ.TILE_HEIGHT * (sizeX - 1)) + (CQ.TILE_HEIGHT * (sizeY - 1));
			var baseY = this.inst.y + (CQ.TILE_HEIGHT/2 * (sizeX - 1)) + (CQ.TILE_HEIGHT/2 * (sizeY - 1));
			for (var x = 1; x <= sizeY; x++){ //intentionally using sizeY for x index and vice-versa...
				var dust = this.runtime.createInstance(
										this.runtime.types_by_index[CQ.typeIndexMap["CQDust"]],
										this.runtime.running_layout.layers[CQ.LAYER_TOP],
										baseX - (CQ.TILE_HEIGHT * x),
										baseY - (CQ.TILE_HEIGHT/2 * x));		
				CQ.moveInstToZIndex(dust, this.inst.zindex);
			}
			for (var y = 1; y <= sizeX; y++){ 
				var dust = this.runtime.createInstance(
										this.runtime.types_by_index[CQ.typeIndexMap["CQDust"]],
										this.runtime.running_layout.layers[CQ.LAYER_TOP],
										baseX + (CQ.TILE_HEIGHT * y),
										baseY - (CQ.TILE_HEIGHT/2 * y));		
				CQ.moveInstToZIndex(dust, this.inst.zindex);			
			}
			var dust = this.runtime.createInstance( // base dust
									this.runtime.types_by_index[CQ.typeIndexMap["CQDust"]],
									this.runtime.running_layout.layers[CQ.LAYER_TOP],
									baseX,
									baseY);	
			CQ.moveInstToZIndex(dust, this.inst.zindex);
		}
	};
	
	behinstProto.ignite = function ()
	{
		if (this.inst.health <= 0)
			return;
		if (!this.ignited){
			this.ignited = true;
			var sizeX = this.inst.tileSize[0];
			var sizeY = this.inst.tileSize[1];
			for (var x = 0; x < sizeX; x++){
				for (var y = 0; y < sizeY; y++){
					var fire = this.runtime.createInstance(
											this.runtime.types_by_index[CQ.typeIndexMap["CQFire"]],
											this.runtime.running_layout.layers[CQ.LAYER_TOP],
											this.inst.x - (CQ.TILE_HEIGHT * x) + (CQ.TILE_HEIGHT * y),
											this.inst.y + (CQ.TILE_HEIGHT/2 * x) + (CQ.TILE_HEIGHT/2 * y) - CQ.TILE_HEIGHT / 2);		
					CQ.moveInstToZIndex(fire, this.inst.zindex + 1);					
				}	
			}
		}
	}
	
	behinstProto.contaminate = function ()
	{
		if (this.inst.health <= 0)
			return;
		if (!this.contaminated){
			this.contaminated = true;			
			var sizeX = this.inst.tileSize[0];
			var sizeY = this.inst.tileSize[1];
			for (var x = 0; x < sizeX; x++){
				for (var y = 0; y < sizeY; y++){					
					var waste = this.runtime.createInstance(
											this.runtime.types_by_index[CQ.typeIndexMap["CQWaste"]],
											this.runtime.running_layout.layers[CQ.LAYER_TOP],
											this.inst.x - (CQ.TILE_HEIGHT * x) + (CQ.TILE_HEIGHT * y),
											this.inst.y + (CQ.TILE_HEIGHT/2 * x) + (CQ.TILE_HEIGHT/2 * y) - CQ.TILE_HEIGHT / 2);		
					CQ.moveInstToZIndex(waste, this.inst.zindex + 1);					
				}	
			}	
		}
	}
	
	behinstProto.onDestroy = function ()
	{
	
	};


	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.IsMoving = function ()
	{
		// ... see other behaviors for example implementations ...
		return false;
	};
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.Stop = function ()
	{
		// ... see other behaviors for example implementations ...
	};
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());
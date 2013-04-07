// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQdamaging = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQdamaging.prototype;
		
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
		this.inst.damage = this.properties[0];
		this.inst.alreadyHit = [];
		this.inst.collisionActive = true;
	};


	behinstProto.tick = function ()
	{
		var inst = this.inst;
		var dt = this.runtime.getDt(inst);
		
		if (inst.collisionActive){
			var types = this.runtime.types_by_index;
			for(var i = 0; i < types.length; i++){
				if (typeHasBehavior(types[i], "CQDestroyable")){
					for(var j = 0; j < types[i].instances.length; j++){
						if (this.runtime.testOverlap(inst, types[i].instances[j])){
							var destroyable = types[i].instances[j];
							if (inst.alreadyHit.indexOf(destroyable) < 0){
								destroyable.health -= inst.damage;
								inst.alreadyHit.push(destroyable);
							}
						}
					}
				}
			}
		}
	};
	
	function typeHasBehavior(type, behaviorName){
		for(var b = 0; b < type.behaviors.length; b++){
			if (type.behaviors[b].name === behaviorName)
				return true;
		}
		return false;
	}

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
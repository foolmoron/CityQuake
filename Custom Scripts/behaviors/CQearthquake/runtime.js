// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQearthquake = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQearthquake.prototype;
		
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
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		// called every tick for you to update this.inst as necessary
		// dt is the amount of time passed since the last tick, in case it's a movement
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
	Acts.prototype.CreateTangentObject = function (obj)
	{
		var CQ = cr.plugins_.CQLevels.prototype.Instance.prototype;
		
		var sol = this.type.objtype.getCurrentSol();
		var quake1 = sol.instances[0];
		var quake2 = sol.instances[1];
		
		var dy = quake2.y - quake1.y;
		var dx = quake2.x - quake1.x;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var unitVectorY = dy/dist;
		var unitVectorX = dx/dist;
		var collisionY = quake1.y + (unitVectorY * (quake1.height / 2));
		var collisionX = quake1.x + (unitVectorX * (quake1.width / 2));
		var dToCollisionY = collisionY - quake1.y;
		var dToCollisionX = collisionX - quake1.x;
		var distToCollision = Math.sqrt(dToCollisionX * dToCollisionX + dToCollisionY * dToCollisionY);
		if (distToCollision >= dist){ //one circle within another
			return;
		}
		
		var fault = this.runtime.createInstance(obj, this.runtime.running_layout.layers[CQ.getBottomLayer()], collisionX, collisionY);
		var angle = Math.atan2(dy, dx);
		var degs = angle * (180 / Math.PI);
		fault.angle = angle;
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
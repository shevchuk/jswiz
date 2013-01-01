/**
 * @author: Mikhail Shevchuk
 * @description: jswiz is a skeleton for a wizard
 */

function Wiz(name)
{
    this.wizName = name;
    this.wizSteps = [];
    this.wizStorage = {};

    this._currentStep = 0;
}


Wiz.prototype = {
    toString: function () {
        var res = 'Name: ' + this.wizName + '\n';
        res += 'Steps: \n';
        for (var i=0; i<this.wizSteps.length; i++)
        {
            res += i + ' step: ' + this.wizSteps[i].wizName + '\n';
        }
        return res;
    },

    getStorage: function() {
        return this.wizStorage;
    },

    addStep: function(step) {
        this.wizSteps.push(step);
    },

    start: function() {
        this._currentStep = 0;

        var currentStep = this.wizSteps[this._currentStep];
        currentStep.enterStep();
    },

    next: function() {
        // store current step
        var prevStep = this.wizSteps[this._currentStep];

        // pass result to the next step
        prevStep.beforeExit && prevStep.beforeExit();

        // save result into storage
        extend(prevStep.getValues(), this.wizStorage);

        // out of steps
        if (this._currentStep == this.wizSteps.length-1) return;

        if (prevStep.getValues == undefined) {
            throw "getValues function is not defined";
            return;
        }

        // go to next step
        this._currentStep ++;
        var nextStep = this.wizSteps[this._currentStep];

        function extend(src, dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    dst[k] = src[k];
                }
            }
            return dst;
        };

        nextStep.enterStep(prevStep.getValues());

        return this.wizSteps[this._currentStep];
    },

    extend: function(destination) {
        for (var k in this) {
            destination[k] = this[k];
        }
        return destination;
    }
};

function WizStep(config)
{
    var config = config || {name: 'Unnamed'};

    this.wizName = config.name;
    if (config.getValues == undefined) {
        throw "getValues is mandatory, should be a function that returns an object with keys, values";
    }
    this.getValues = config.getValues;
    this.onEnter = config.onEnter;
    this.beforeExit = config.beforeExit;

    this.input = null;
}

WizStep.prototype = {
    toString:function() {
        return 'Step: ' + this.wizName;
    },
    enterStep: function(param) {
        this.input = param;

        // call onEnter hook
        this.onEnter && this.onEnter(param);
    },
    extend: function(destination) {
        for (var k in this) {
            destination[k] = this[k];
        }
        return destination;
    }
};
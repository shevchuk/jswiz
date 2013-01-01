/**
 * @author: Mikhail Shevchuk
 * @description: jswiz is a skeleton for a wizard
 */

function Wiz(config)
{
    this.config = config;
    this.wizName = config.name;
    this.wizSteps = [];
    this.wizStorage = {};

    this._currentStepNumber = 0;
    this._currentStep;
}

Wiz.prototype = {
    toString: function () {
        var res = 'Name: ' + this.wizName + '\n';
        res += 'Steps: \n';
        for (var i=0; i<this.wizSteps.length; i++)
        {
            res += i + ' step: ' + this.wizSteps[i].stepName + '\n';
        }
        return res;
    },

    getStepByName: function(name) {
        for (var i=0; this.wizSteps.length; i++)
        {
            if (this.wizSteps[i].stepName == name) {
                return this.wizSteps[i];
            }
        }
    },

    getCurrentStep: function() {
        return this._currentStep;
    },

    getStorage: function() {
        return this.wizStorage;
    },

    addStep: function(step) {
        this.wizSteps.push(step);
    },

    start: function() {
        if (this.wizSteps.length == 0) {
            throw 'no steps defined in this wizard: ' + this.wizName;
        };

        this._currentStepNumber = 0;
        var self = this;

        // check that goTo's are set
        checkGoTos();
        function checkGoTos() {
            if (self.config.sequential) return;
            for (var i = 0; i < self.wizSteps.length; i++) {
                if (self.wizSteps[i].goTo == undefined) {
                    throw "goTo is not defined in step: " + self.wizSteps[i].stepName;
                }
            }
        }
        var currentStep = this.wizSteps[this._currentStepNumber];
        currentStep.enterStep();
        self._currentStep = currentStep;
    },

    next: function() {
        // store current step
        var prevStep = this._currentStep;

        // pass result to the next step
        prevStep.beforeExit && prevStep.beforeExit();

        // save result into storage
        extend(prevStep.getValues(), this.wizStorage);

        // out of steps
        if (this._currentStepNumber == this.wizSteps.length-1) return;

        if (prevStep.getValues == undefined) {
            throw "getValues function is not defined";
            return;
        }

        // go to next step
        this._currentStepNumber ++;

        var nextStep;
        if (prevStep.goTo) {
            nextStep = this.getStepByName(prevStep.goTo());
        } else
        {
            nextStep = this.wizSteps[this._currentStepNumber];
        }

        this._currentStep = nextStep;

        function extend(src, dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    dst[k] = src[k];
                }
            }
            return dst;
        };

        nextStep.enterStep(prevStep.getValues());

        return nextStep;
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

    this.stepName = config.name;
    if (config.name == undefined) {
        throw "name is mandatory, should be unique";
    };

    this.goTo = config.goTo;

    if (config.getValues == undefined) {
        throw "getValues is mandatory, should be a function that returns an object with keys, values";
    };

    this.getValues = config.getValues;
    this.onEnter = config.onEnter;
    this.beforeExit = config.beforeExit;

    this.input = null;
}

WizStep.prototype = {
    toString:function() {
        return 'Step: ' + this.stepName;
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
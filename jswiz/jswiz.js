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
    this._prevStep;
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

    /*
     * resets the wizard storage
     */
    reset: function() {
        this.wizStorage = {};
    },

    start: function() {
        this.reset();
        if (this.wizSteps.length == 0) {
            throw 'no steps defined in this wizard: ' + this.wizName;
        };

        this._currentStepNumber = 0;
        var self = this;

        // check that getNextSteps are set
        checkGetNextStep();
        function checkGetNextStep() {
            if (self.config.sequential) return;
            for (var i = 0; i < self.wizSteps.length; i++) {
                if (self.wizSteps[i].getNextStep == undefined) {
                    throw "getNextStep is not defined in step: " + self.wizSteps[i].stepName;
                }
            }
        }

        // store current step
        var currentStep = this.wizSteps[this._currentStepNumber];

        // store current step as prev also
        self._prevStep = currentStep;

        currentStep.enterStep();
        self._currentStep = currentStep;
    },

    back: function() {
        this._currentStep = this._prevStep;
        this._currentStep.enterStep();
    },

    next: function() {
        // store current step as previous
        var prevStep = this._currentStep;
        this._prevStep = prevStep;

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
        if (prevStep.getNextStep) {
            nextStep = this.getStepByName(prevStep.getNextStep());
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

    this.getNextStep = config.getNextStep;

    if (config.getValues == undefined) {
        throw "getValues is mandatory, should be a function that returns an object with keys, values";
    };

    this.getValues = config.getValues;

    // hooks
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
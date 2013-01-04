/**
 * @author: Mikhail Shevchuk <mikhail.shevchuk@gmail.com>
 * @description: jswiz is a wizard skeleton
 */

function Wiz(config)
{
    this.config = config || {name: 'UnnamedWizard'};

    this.onComplete = this.config.onComplete;
    this.wizName = this.config.name;

    this.wizSteps = [];
    this._wizStorage = {};

    this._currentStepNumber = 0;
    this._currentStep;
    this._completed = false;

    // history
    this._stepHistory = [];
    this._wizStorageHistory = [];
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
        for (var i=0; i < this.wizSteps.length; i++)
        {
            if (this.wizSteps[i].stepName == name) {
                return this.wizSteps[i];
            }
        }
    },

    getPreviousStep: function() {
        return this._stepHistory.pop();
    },

    getCurrentStep: function() {
        return this._currentStep;
    },

    getStorage: function() {
        return this._wizStorage;
    },

    addStep: function(step) {
        this.wizSteps.push(step);
    },

    /*
     * resets the wizard storage
     */
    reset: function() {
        this._wizStorage = {};
        this._stepHistory = [];
        this._wizStorageHistory = [];
    },

    start: function() {
        this.reset();
        if (this.wizSteps.length == 0) {
            throw new WizError(WizError.WIZ_NO_STEPS + this.wizName);
        };

        this._currentStepNumber = 0;
        var self = this;

        // check that getNextSteps are set
        checkGetNextStep();
        function checkGetNextStep() {
            if (self.config.sequential) return;
            for (var i = 0; i < self.wizSteps.length; i++) {
                if (self.wizSteps[i].getNextStep == undefined) {
                    throw new WizError(WizError.WIZ_STEP_NO_GET_NEXT_STEP + self.wizSteps[i].stepName);
                }
            }
        }

        // store current step
        var currentStep = this.wizSteps[this._currentStepNumber];

        // store current step as prev also
        self._stepHistory.push(currentStep);

        currentStep.enterStep();
        self._currentStep = currentStep;
    },

    back: function() {
        this._currentStep = this.getPreviousStep();
        this._currentStep.enterStep();

        /*
         * restore storage
         */

        // if this is the last step in the wiz and it is completed
        // then pop it's value too
        if (this._completed) {
            this._wizStorageHistory.pop();
        }

        this._wizStorageHistory.pop();
        this._wizStorage = this._wizStorageHistory.pop();
        if (!this._wizStorage) {
            this._wizStorage = {};
        }
    },

    updateStorage : function(newValue) {
        extend(newValue, this._wizStorage);

        // save current storage into the history
        this._wizStorageHistory.push(clone(this.getStorage()));

        function clone(storage) {
            var obj = {};
            for (var k in storage) {
                obj[k] = storage[k];
            }
            return obj;
        }

        function extend(src, dst) {
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    dst[k] = src[k];
                }
            }
            return dst;
        };
    },

    next: function() {
        // do nothing if completed
        if (this._completed) return;
        // store current step as previous
        var prevStep = this._currentStep;

        // pass result to the next step
        prevStep.beforeExit && prevStep.beforeExit();

        // save result into storage
        this.updateStorage(prevStep.getValues());

        // save history
        this._stepHistory.push(prevStep);

        // out of steps
        if (this._currentStepNumber == this.wizSteps.length-1 &&
            this.config.sequential)
        {
            this._completed = true;

            this.onComplete && this.onComplete();
            return;
        }

        // this is a final step
        if (prevStep.final)
        {
            this._completed = true;

            this.onComplete && this.onComplete();
            return;
        }

        // go to next step
        var nextStep;

        if (prevStep.getNextStep && !this.config.sequential) {
            nextStep = this.getStepByName(prevStep.getNextStep());
            if (nextStep == undefined) {
                throw new WizError(WizError.WIZ_NEXT_STEP_WAS_NOT_FOUND + '(step name: [' + prevStep.getNextStep() +
                    '] was not found in [' + prevStep.stepName +']');
            }
        } else
        {
            this._currentStepNumber ++;
            nextStep = this.wizSteps[this._currentStepNumber];
        }

        this._currentStep = nextStep;

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
        throw new WizError(WizError.WIZ_STEP_NAME);
    };

    this.final = config.final;
    this.getNextStep = config.getNextStep;

    if (config.getValues == undefined) {
        throw new WizError(WizError.WIZ_STEP_GET_VALUES);
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

function WizError(message) {
    this.message = message;
}

WizError.prototype = {
    toString: function() {
        return this.message;
    }
};

WizError.WIZ_STEP_NAME = "name is mandatory, should be unique";
WizError.WIZ_STEP_GET_VALUES = "getValues is mandatory, should be a function that returns an object with keys, values";
WizError.WIZ_NO_STEPS = "no steps defined in this wizard: ";
WizError.WIZ_STEP_NO_GET_NEXT_STEP = "getNextStep is not defined in step: ";
WizError.WIZ_NEXT_STEP_WAS_NOT_FOUND = "Next step was not found. If this is the last step, you should set `final: true`";


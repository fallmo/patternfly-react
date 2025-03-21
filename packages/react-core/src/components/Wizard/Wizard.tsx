import * as React from 'react';
import { KeyTypes } from '../../helpers/constants';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Wizard/wizard';
import { Modal, ModalVariant } from '../Modal';
import { WizardFooterInternal } from './WizardFooterInternal';
import { WizardToggle } from './WizardToggle';
import { WizardNav } from './WizardNav';
import { WizardNavItem, WizardNavItemProps } from './WizardNavItem';
import { WizardContextProvider } from './WizardContext';
import { PickOptional } from '../../helpers/typeUtils';
import { WizardHeader } from './WizardHeader';

export interface WizardStep {
  /** Optional identifier */
  id?: string | number;
  /** The name of the step */
  name: React.ReactNode;
  /** The component to render in the main body */
  component?: any;
  /** The content to render in the drawer panel (use when hasDrawer prop is set on the wizard).   */
  drawerPanelContent?: any;
  /** Custom drawer toggle button that opens the drawer. */
  drawerToggleButton?: React.ReactNode;
  /** Setting to true hides the side nav and footer */
  isFinishedStep?: boolean;
  /** Enables or disables the step in the navigation. Enabled by default. */
  canJumpTo?: boolean;
  /** Sub steps */
  steps?: WizardStep[];
  /** Props to pass to the WizardNavItem */
  stepNavItemProps?: React.HTMLProps<HTMLButtonElement | HTMLAnchorElement> | WizardNavItemProps;
  /** (Unused if footer is controlled) Can change the Next button text. If nextButtonText is also set for the Wizard, this step specific one overrides it. */
  nextButtonText?: React.ReactNode;
  /** (Unused if footer is controlled) The condition needed to enable the Next button */
  enableNext?: boolean;
  /** (Unused if footer is controlled) True to hide the Cancel button */
  hideCancelButton?: boolean;
  /** (Unused if footer is controlled) True to hide the Back button */
  hideBackButton?: boolean;
  /** Flag to disable the step in the navigation */
  isDisabled?: boolean;
}

export type WizardStepFunctionType = (
  newStep: { id?: string | number; name: React.ReactNode },
  prevStep: { prevId?: string | number; prevName: React.ReactNode }
) => void;

export interface WizardProps extends React.HTMLProps<HTMLDivElement> {
  /** Custom width of the wizard */
  width?: number | string;
  /** Custom height of the wizard */
  height?: number | string;
  /** The wizard title to display if header is desired */
  title?: string;
  /** An optional id for the title */
  titleId?: string;
  /** An optional id for the description */
  descriptionId?: string;
  /** The wizard description */
  description?: React.ReactNode;
  /** Component type of the description */
  descriptionComponent?: 'div' | 'p';
  /** Flag indicating whether the close button should be in the header */
  hideClose?: boolean;
  /** Callback function to close the wizard */
  onClose?: () => void;
  /** Callback function when a step in the nav is clicked */
  onGoToStep?: WizardStepFunctionType;
  /** Additional classes spread to the Wizard */
  className?: string;
  /** The wizard steps configuration object */
  steps: WizardStep[];
  /** The current step the wizard is on (1 or higher) */
  startAtStep?: number;
  /** Aria-label for the Nav */
  navAriaLabel?: string;
  /** Sets aria-labelledby on nav element */
  navAriaLabelledBy?: string;
  /** Adds an accessible name to the wizard body when the body content overflows and renders
   * a scrollbar.
   */
  mainAriaLabel?: string;
  /** Adds an accessible name to the wizard body by passing the the id of one or more elements.
   * The aria-labelledby will only be applied when the body content overflows and renders a scrollbar.
   */
  mainAriaLabelledBy?: string;
  /** Can remove the default padding around the main body content by setting this to true */
  hasNoBodyPadding?: boolean;
  /** (Use to control the footer) Passing in a footer component lets you control the buttons yourself */
  footer?: React.ReactNode;
  /** (Unused if footer is controlled) Callback function to save at the end of the wizard, if not specified uses onClose */
  onSave?: () => void;
  /** (Unused if footer is controlled) Callback function after Next button is clicked */
  onNext?: WizardStepFunctionType;
  /** (Unused if footer is controlled) Callback function after Back button is clicked */
  onBack?: WizardStepFunctionType;
  /** (Unused if footer is controlled) The Next button text */
  nextButtonText?: React.ReactNode;
  /** (Unused if footer is controlled) The Back button text */
  backButtonText?: React.ReactNode;
  /** (Unused if footer is controlled) The Cancel button text */
  cancelButtonText?: React.ReactNode;
  /** (Unused if footer is controlled) aria-label for the close button */
  closeButtonAriaLabel?: string;
  /** The parent container to append the modal to. Defaults to document.body */
  appendTo?: HTMLElement | (() => HTMLElement);
  /** Flag indicating Wizard modal is open. Wizard will be placed into a modal if this prop is provided */
  isOpen?: boolean;
  /** Flag indicating nav items with sub steps are expandable */
  isNavExpandable?: boolean;
  /** Callback function to signal the current step in the wizard */
  onCurrentStepChanged?: (step: WizardStep) => void;
  /** Flag indicating the wizard has a drawer for at least one of the wizard steps */
  hasDrawer?: boolean;
  /** Flag indicating the wizard drawer is expanded */
  isDrawerExpanded?: boolean;
  /** Callback function for when the drawer is toggled. Can be used to set browser focus in the drawer. */
  onExpandDrawer?: () => void;
}

interface WizardState {
  currentStep: number;
  isNavOpen: boolean;
}

export class Wizard extends React.Component<WizardProps, WizardState> {
  static displayName = 'Wizard';
  private static currentId = 0;
  static defaultProps: PickOptional<WizardProps> = {
    title: null,
    description: '',
    descriptionComponent: 'p',
    className: '',
    startAtStep: 1,
    nextButtonText: 'Next',
    backButtonText: 'Back',
    cancelButtonText: 'Cancel',
    hideClose: false,
    closeButtonAriaLabel: 'Close',
    navAriaLabel: null,
    navAriaLabelledBy: null,
    mainAriaLabel: null,
    mainAriaLabelledBy: null,
    hasNoBodyPadding: false,
    onBack: null as WizardStepFunctionType,
    onNext: null as WizardStepFunctionType,
    onGoToStep: null as WizardStepFunctionType,
    width: null as string,
    height: null as string,
    footer: null as React.ReactNode,
    onClose: () => undefined as any,
    appendTo: null as HTMLElement,
    isOpen: undefined,
    isNavExpandable: false,
    hasDrawer: false,
    isDrawerExpanded: false,
    onExpandDrawer: () => undefined as any
  };
  private titleId: string;
  private descriptionId: string;
  private drawerRef: React.RefObject<any>;

  constructor(props: WizardProps) {
    super(props);
    const newId = Wizard.currentId++;
    this.titleId = props.titleId || `pf-wizard-title-${newId}`;
    this.descriptionId = props.descriptionId || `pf-wizard-description-${newId}`;

    this.state = {
      currentStep: this.props.startAtStep && Number.isInteger(this.props.startAtStep) ? this.props.startAtStep : 1,
      isNavOpen: false
    };

    if (props.onCurrentStepChanged) {
      const flattenedSteps = this.getFlattenedSteps();
      if (flattenedSteps.length >= this.state.currentStep) {
        const currentStep = flattenedSteps[this.state.currentStep - 1];
        props.onCurrentStepChanged(currentStep);
      }
    }

    this.drawerRef = React.createRef();
  }

  private handleKeyClicks = (event: KeyboardEvent): void => {
    if (event.key === KeyTypes.Escape) {
      if (this.state.isNavOpen) {
        this.setState({ isNavOpen: !this.state.isNavOpen });
      } else if (this.props.isOpen) {
        this.props.onClose();
      }
    }
  };

  private onNext = (): void => {
    const { onNext, onClose, onSave } = this.props;
    const { currentStep } = this.state;
    const flattenedSteps = this.getFlattenedSteps();
    const maxSteps = flattenedSteps.length;
    if (currentStep >= maxSteps) {
      // Hit the save button at the end of the wizard
      if (onSave) {
        return onSave();
      }
      return onClose();
    } else {
      let newStep = currentStep;

      for (let nextStep = currentStep; nextStep <= maxSteps; nextStep++) {
        if (!flattenedSteps[nextStep]) {
          return;
        }

        if (!flattenedSteps[nextStep].isDisabled) {
          newStep = nextStep + 1;
          break;
        }
      }

      this.setCurrentStep(newStep, flattenedSteps[newStep - 1]);
      const { id: prevId, name: prevName } = flattenedSteps[currentStep - 1];
      const { id, name } = flattenedSteps[newStep - 1];
      return onNext && onNext({ id, name }, { prevId, prevName });
    }
  };

  private onBack = (): void => {
    const { onBack } = this.props;
    const { currentStep } = this.state;
    const flattenedSteps = this.getFlattenedSteps();
    if (flattenedSteps.length < currentStep) {
      // Previous step was removed, just update the currentStep state
      const adjustedStep = flattenedSteps.length;
      this.setCurrentStep(adjustedStep, flattenedSteps[adjustedStep - 1]);
    } else {
      let newStep = currentStep;

      for (let prevStep = currentStep; prevStep >= 0; prevStep--) {
        if (!flattenedSteps[prevStep - 2]) {
          return;
        }

        if (!flattenedSteps[prevStep - 2].isDisabled) {
          newStep = prevStep - 1 <= 1 ? 1 : prevStep - 1;
          break;
        }
      }

      this.setCurrentStep(newStep, flattenedSteps[newStep - 1]);
      const { id: prevId, name: prevName } = flattenedSteps[newStep];
      const { id, name } = flattenedSteps[newStep - 1];
      return onBack && onBack({ id, name }, { prevId, prevName });
    }
  };

  private goToStep = (step: number): void => {
    const flattenedSteps = this.getFlattenedSteps();

    if (flattenedSteps[step - 1].isDisabled) {
      return;
    }

    const { onGoToStep } = this.props;
    const { currentStep } = this.state;
    const maxSteps = flattenedSteps.length;
    if (step < 1) {
      step = 1;
    } else if (step > maxSteps) {
      step = maxSteps;
    }
    this.setCurrentStep(step, flattenedSteps[step - 1]);
    this.setState({ isNavOpen: false });
    const { id: prevId, name: prevName } = flattenedSteps[currentStep - 1];
    const { id, name } = flattenedSteps[step - 1];
    return onGoToStep && onGoToStep({ id, name }, { prevId, prevName });
  };

  private goToStepById = (stepId: number | string): void => {
    const flattenedSteps = this.getFlattenedSteps();
    let step;
    for (let i = 0; i < flattenedSteps.length; i++) {
      if (flattenedSteps[i].id === stepId) {
        step = i + 1;
        break;
      }
    }
    if (step) {
      this.setCurrentStep(step, flattenedSteps[step - 1]);
    }
  };

  private goToStepByName = (stepName: string): void => {
    const flattenedSteps = this.getFlattenedSteps();
    let step;
    for (let i = 0; i < flattenedSteps.length; i++) {
      if (flattenedSteps[i].name === stepName) {
        step = i + 1;
        break;
      }
    }
    if (step) {
      this.setCurrentStep(step, flattenedSteps[step - 1]);
    }
  };

  private getFlattenedSteps = (): WizardStep[] => {
    const { steps } = this.props;
    const flattenedSteps: WizardStep[] = [];
    for (const step of steps) {
      if (step.steps) {
        for (const childStep of step.steps) {
          flattenedSteps.push(childStep);
        }
      } else {
        flattenedSteps.push(step);
      }
    }
    return flattenedSteps;
  };

  private getFlattenedStepsIndex = (flattenedSteps: WizardStep[], stepName: React.ReactNode): number => {
    for (let i = 0; i < flattenedSteps.length; i++) {
      if (flattenedSteps[i].name === stepName) {
        return i + 1;
      }
    }

    return 0;
  };

  private initSteps = (steps: WizardStep[]): WizardStep[] => {
    // Set default Step values
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].steps) {
        for (let j = 0; j < steps[i].steps.length; j++) {
          steps[i].steps[j] = Object.assign({ canJumpTo: true }, steps[i].steps[j]);
        }
      }
      steps[i] = Object.assign({ canJumpTo: true }, steps[i]);
    }
    return steps;
  };

  getElement = (appendTo: HTMLElement | (() => HTMLElement)) => {
    if (typeof appendTo === 'function') {
      return appendTo();
    }
    return appendTo || document.body;
  };

  private setCurrentStep(currentStep: number, currentStepObject: WizardStep) {
    this.setState({
      currentStep
    });

    if (this.props.onCurrentStepChanged) {
      this.props.onCurrentStepChanged(currentStepObject);
    }
  }

  componentDidMount() {
    const target = typeof document !== 'undefined' ? document.body : null;
    if (target) {
      target.addEventListener('keydown', this.handleKeyClicks, false);
    }
  }

  componentWillUnmount() {
    const target = (typeof document !== 'undefined' && document.body) || null;
    if (target) {
      target.removeEventListener('keydown', this.handleKeyClicks, false);
    }
  }

  componentDidUpdate(prevProps: Readonly<WizardProps>) {
    if (prevProps.startAtStep !== this.props.startAtStep) {
      this.setState({ currentStep: this.props.startAtStep });
    }
  }

  render() {
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      width,
      height,
      title,
      description,
      descriptionComponent,
      onClose,
      onSave,
      onBack,
      onNext,
      onGoToStep,
      className,
      steps,
      startAtStep,
      nextButtonText = 'Next',
      backButtonText = 'Back',
      cancelButtonText = 'Cancel',
      hideClose,
      closeButtonAriaLabel = 'Close',
      navAriaLabel,
      navAriaLabelledBy,
      mainAriaLabel,
      mainAriaLabelledBy,
      hasNoBodyPadding,
      footer,
      appendTo,
      isOpen,
      titleId,
      descriptionId,
      isNavExpandable,
      onCurrentStepChanged,
      hasDrawer,
      isDrawerExpanded,
      onExpandDrawer,
      ...rest
      /* eslint-enable @typescript-eslint/no-unused-vars */
    } = this.props;
    const { currentStep } = this.state;
    const flattenedSteps = this.getFlattenedSteps();
    const adjustedStep = flattenedSteps.length < currentStep ? flattenedSteps.length : currentStep;
    const activeStep = flattenedSteps[adjustedStep - 1];
    const computedSteps: WizardStep[] = this.initSteps(steps);
    const firstStep = activeStep === flattenedSteps[0];
    const isValid = activeStep && activeStep.enableNext !== undefined ? activeStep.enableNext : true;

    const nav = (isWizardNavOpen: boolean) => {
      const wizNavAProps = {
        isOpen: isWizardNavOpen,
        'aria-label': navAriaLabel,
        'aria-labelledby': (title || navAriaLabelledBy) && (navAriaLabelledBy || this.titleId)
      };

      return (
        <WizardNav {...wizNavAProps}>
          {computedSteps.map((step, index) => {
            if (step.isFinishedStep) {
              // Don't show finished step in the side nav
              return;
            }
            let enabled;
            let navItemStep;
            if (step.steps) {
              let hasActiveChild = false;
              let canJumpToParent = false;
              for (const subStep of step.steps) {
                if (activeStep.name === subStep.name) {
                  // one of the children matches
                  hasActiveChild = true;
                }
                if (subStep.canJumpTo) {
                  canJumpToParent = true;
                }
              }
              navItemStep = this.getFlattenedStepsIndex(flattenedSteps, step.steps[0].name);
              return (
                <WizardNavItem
                  key={index}
                  id={step.id}
                  content={step.name}
                  isExpandable={isNavExpandable}
                  isCurrent={hasActiveChild}
                  isDisabled={!canJumpToParent}
                  step={navItemStep}
                  onNavItemClick={this.goToStep}
                >
                  <WizardNav {...wizNavAProps} returnList>
                    {step.steps.map((childStep: WizardStep, indexChild: number) => {
                      if (childStep.isFinishedStep) {
                        // Don't show finished step in the side nav
                        return;
                      }
                      navItemStep = this.getFlattenedStepsIndex(flattenedSteps, childStep.name);
                      enabled = childStep.canJumpTo && !childStep.isDisabled;
                      return (
                        <WizardNavItem
                          key={`child_${indexChild}`}
                          id={childStep.id}
                          content={childStep.name}
                          isCurrent={activeStep.name === childStep.name}
                          isDisabled={!enabled}
                          step={navItemStep}
                          onNavItemClick={this.goToStep}
                        />
                      );
                    })}
                  </WizardNav>
                </WizardNavItem>
              );
            }
            navItemStep = this.getFlattenedStepsIndex(flattenedSteps, step.name);
            enabled = step.canJumpTo && !step.isDisabled;

            return (
              <WizardNavItem
                {...step.stepNavItemProps}
                key={index}
                id={step.id}
                content={step.name}
                isCurrent={activeStep.name === step.name}
                isDisabled={!enabled}
                step={navItemStep}
                onNavItemClick={this.goToStep}
              />
            );
          })}
        </WizardNav>
      );
    };

    const context = {
      goToStepById: this.goToStepById,
      goToStepByName: this.goToStepByName,
      onNext: this.onNext,
      onBack: this.onBack,
      onClose,
      activeStep
    };

    const divStyles = {
      ...(height ? { height } : {}),
      ...(width ? { width } : {})
    };

    const wizard = (
      <WizardContextProvider value={context}>
        <div
          {...rest}
          className={css(styles.wizard, activeStep && activeStep.isFinishedStep && 'pf-m-finished', className)}
          style={Object.keys(divStyles).length ? divStyles : undefined}
        >
          {title && (
            <WizardHeader
              titleId={this.titleId}
              descriptionId={this.descriptionId}
              onClose={onClose}
              title={title}
              description={description}
              descriptionComponent={descriptionComponent}
              closeButtonAriaLabel={closeButtonAriaLabel}
              hideClose={hideClose}
            />
          )}
          <WizardToggle
            hasDrawer={hasDrawer}
            isDrawerExpanded={isDrawerExpanded}
            onExpandDrawer={onExpandDrawer}
            mainAriaLabel={mainAriaLabel}
            isInPage={isOpen === undefined}
            mainAriaLabelledBy={(title || mainAriaLabelledBy) && (mainAriaLabelledBy || this.titleId)}
            isNavOpen={this.state.isNavOpen}
            onNavToggle={isNavOpen => this.setState({ isNavOpen })}
            nav={nav}
            steps={steps}
            activeStep={activeStep}
            hasNoBodyPadding={hasNoBodyPadding}
          >
            {footer || (
              <WizardFooterInternal
                onNext={this.onNext}
                onBack={this.onBack}
                onClose={onClose}
                isValid={isValid}
                firstStep={firstStep}
                activeStep={activeStep}
                nextButtonText={(activeStep && activeStep.nextButtonText) || nextButtonText}
                backButtonText={backButtonText}
                cancelButtonText={cancelButtonText}
              />
            )}
          </WizardToggle>
        </div>
      </WizardContextProvider>
    );

    if (isOpen !== undefined) {
      return (
        <Modal
          width={width !== null ? width : undefined}
          isOpen={isOpen}
          variant={ModalVariant.large}
          aria-labelledby={this.titleId}
          aria-describedby={this.descriptionId}
          showClose={false}
          hasNoBodyWrapper
        >
          {wizard}
        </Modal>
      );
    }

    return wizard;
  }
}

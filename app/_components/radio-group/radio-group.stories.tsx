import RadioGroupComponent from "@/components/radio-group/radio-group.component";
import {Meta, StoryObj} from "@storybook/react";

const meta = {
    title: 'RadioGroup',
    component: RadioGroupComponent,
    tags: ['autodocs'],
} satisfies Meta<typeof RadioGroupComponent>

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        radioButtons: [
            { name: "1", value: "1" },
            { name: "2", value: "2" },
            { name: "3", value: "3" },
            { name: "5", value: "5" },
            { name: "8", value: "8" },
        ]
    }
}

export const Disabled: Story = {
    args: {
        radioButtons: [
            { name: "1", value: "1" },
            { name: "2", value: "2" },
            { name: "3", value: "3" },
            { name: "5", value: "5", isChecked: true},
            { name: "8", value: "8" },
        ],
        isDisabled: true
    }
}
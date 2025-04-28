import InputComponent from "@/components/input/input.component";
import { Meta, type StoryObj } from "@storybook/react";

const meta = {
    title: 'Input',
    component: InputComponent,
    tags: ['autodocs'],
} satisfies Meta<typeof InputComponent>

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        label: "Default Input",
        placeholder: "Default Input",
        defaultValue: "Default Value",
        value: "sample input value"
    }
}
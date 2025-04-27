import type { Meta, StoryObj } from '@storybook/react';
import ButtonComponent from "@/components/button/button.component";


const meta = {
    title: 'Button',
    component: ButtonComponent,
    tags: ['autodocs'],
} satisfies Meta<typeof ButtonComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        text: "Default button"
    }
}

export const Disabled: Story = {
    args: {
        text: "Disabled button",
        isDisabled: true
    }
}
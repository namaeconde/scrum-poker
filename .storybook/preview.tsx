import { Preview } from '@storybook/react';
import '../app/globals.css';

const preview: Preview = {
    decorators: [
        (Story) => (
            <>
                {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
                <Story />
            </>
        ),
    ],
};

export default preview;
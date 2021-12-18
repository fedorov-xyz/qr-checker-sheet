import React, { FC } from 'react';
import { SplitCol, SplitLayout, View, Panel } from '@vkontakte/vkui';

export const App: FC = () => {
  return (
    <SplitLayout>
      <SplitCol>
        <View activePanel="">
          <Panel />
        </View>
      </SplitCol>
    </SplitLayout>
  );
};

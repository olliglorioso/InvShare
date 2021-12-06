const sidebarReducer = (state = false, action: { type: string }): boolean => {
  switch (action.type) {
  case "ENABLE":
    return true;
  case "DISABLE":
    return false;
  default:
    return state;
  }
};

export const actionEnableSidebar = (
  enableOrDisable: string
): { type: string } => {
  return {
    type: enableOrDisable,
  };
};

export default sidebarReducer;

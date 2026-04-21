export const DraggableNode = ({ type, label, icon, accentColor, collapsed }) => {
  const onDragStart = (e) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="draggable-node"
      style={{ 
        '--node-accent': accentColor,
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: collapsed ? '12px' : '10px 14px',
        width: collapsed ? '44px' : 'auto',
        height: collapsed ? '44px' : 'auto',
      }}
      onDragStart={onDragStart}
      draggable
      title={collapsed ? label : ''}
    >
      {!collapsed && <div className="draggable-node-dot" />}
      
      {icon && (
        <span style={{ fontSize: collapsed ? '1.3rem' : '1.1rem', lineHeight: 1 }}>
          {icon}
        </span>
      )}
      {!collapsed && <span className="draggable-node-label">{label}</span>}
    </div>
  );
};
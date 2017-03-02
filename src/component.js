import { select, selectAll } from "d3-selection";
var noop = function (){},
    instanceLocal = function (node, value){
      return value ? (node.__instance__ = value) : node.__instance__;
    };

export default function (tagName, className){
  var create = noop,
      render = noop,
      destroy = noop,
      createInstance = function (){
        var instance = instanceLocal(this, {
          selection: select(this),
          state: {},
          render: noop,
          destroy: destroy
        });
        create(instance.selection, function setState(state){
          Object.assign(instance.state, state);
          instance.render();
        });
        instance.render = function (){
          render(instance.selection, instance.props, instance.state);
        };
      },
      renderInstance = function (props){
        var instance = instanceLocal(this);
        instance.props = props || {};
        instance.render();
      },
      destroyInstance = function (){
        var instance = instanceLocal(this);
        instance.selection.selectAll("*").each(function (){
          var instance = instanceLocal(this);
          if(instance) instance.destroy(instance.state);
        });
        instance.destroy(instance.state);
        instance.selection.remove();
      },
      selector = className ? "." + className : tagName,
      key;

  function component(selection, props){
    var instances = selection.selectAll(selector)
      .data(Array.isArray(props) ? props : [props], key);
    instances.enter().append(tagName)
        .attr("class", className)
        .each(createInstance)
      .merge(instances)
        .each(renderInstance);
    instances.exit().each(destroyInstance);
  }
  component.render = function(_) { return (render = _, component); };
  component.create = function(_) { return (create = _, component); };
  component.destroy = function(_) { return (destroy = _, component); };
  component.key = function(_) { return (key = _, component); };

  return component;
};

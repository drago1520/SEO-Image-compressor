//фукция за обновяване на опциите
//OK : ИЗЦЯЛО ПРЕМАХНИ INDEX и сравнявай само по име! OK
// ЗНАМ, функциите ми не са чисти...
//# добави id
const updateOptions = function(name, filesNew, defaultOptions, setOptions, options ,resetAll=false, key="", value="") {
 
    let newOptions = JSON.parse(JSON.stringify(options)) // Deep copy. React = immutability
    
    //OK
    if(resetAll){
      setOptions([{
        name: "default13241412434q3r235r2342342$^$refs.png",
        ...defaultOptions
      }])
      return 
    }
   
  // ОК Направих й тест, работи перфе. синхронизира опциите, точно колкото файла са.
  // OK Ако няма опция спрямо файловете добави. След като е добавило за всички, провери пак. Ако няма опция, премахни я
    const syncOptions = function() {
      
    //Assign default values to missing options based on the current files
    let temp = filesNew.filter((file)=>{ //Вземи имената на required files without options
  
      let temp2 = newOptions.filter((option)=>{
        if(file.name!==option.name) {
          return true
        }
        else return false
        
      }) //Има ли опция за този required файл?
      // console.log('temp2 :', temp2);
      if(temp2.length===1) { 
        return true //Ако няма, върни файла, за да използваш името му и да зададеш default опция.
      }
      else return false //Ако има, не връщай името на файла, че да се задава нов default required option.
    })
    let optionsToFIllNames = temp.map((option)=>option.name) //Вземи само имената на required files without options
  //  console.log('optionsToFIll :', optionsToFIllNames);
    optionsToFIllNames.forEach((optionToFillName)=>{ //Добави нови default required options
      newOptions.push({
        name: optionToFillName,
        ...defaultOptions
      })
    })
  //До тук е напълнило опциите с нужните опции спрямо файловете, но още може да има опции, които са излишни
  
  
    //Removing option based on current files
    newOptions = newOptions.filter((option)=>{
      let isRequiredOption = filesNew.some((file)=>file.name === option.name) //Има ли файлове за тази опция?
      if(isRequiredOption) { //Ако има, запази опцията
  //      console.log("This is a required option, i.e. the file exists and there is an option for it. Keep it!") 
        return true
      }
      else{ //Ако няма, премахни я. Сигурно файла е изтрит
  //      console.log("No file found for this option. Probably the file was removed. Removing option.") 
        return false
      }
    })
    
     if(newOptions.length === 0){
      newOptions.push({
        name: "default13241412434q3r235r2342342$^$refs.png", //Бъг - оставяше 2 опции с важно име.
        ...defaultOptions
      })
      console.log("Options at lenght 0, need to add one option at least"); 
    }
    
  };
  syncOptions();
  
  
    const modifyExistingOptions = () =>{
      if(!(key==="" && value==="")){
       newOptions = newOptions.map((option)=>{
        let modifiedOption = option.name === name ? {...option, [key]:value} : option
  //      console.log('modifiedOption :', modifiedOption);
         return modifiedOption
        })
    }
  //  else console.log(`Did not modify any options. No key and value provided`);
      
    }
    modifyExistingOptions();
    //Използвам React useState
     setOptions(newOptions) 
  };

export default updateOptions;
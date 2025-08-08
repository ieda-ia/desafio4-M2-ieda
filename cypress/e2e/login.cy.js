describe('Login', () => {
  beforeEach(() =>{
    //Arrange
    cy.visit('/')
    cy.screenshot('apos-visitar-pagina')
  })  
  
  it('Login com dados VÁLIDOS deve permitir acessar tela do perfil do usuário', () => {
    //Act
    cy.cadastraUsuarioRandom().then(uuid => {
      cy.get('#login').focus().click().type(`teste${uuid}@empresa.com`)
      cy.get('#senha').focus().type('teste123')
      cy.contains('.btn', 'Entrar').click() 
    })
    //Asserts
      cy.contains('h4', 'Painel do Usuário').should('be.visible')
      cy.get('a').contains('Sair').click() 
  })

  it('Login com dados INVÁLIDOS não deve permitir acessar tela do perfil do usuário', () => {
    //Act
    cy.preencheUsuario('usuario1', 'invalida')
    cy.contains('.btn', 'Entrar').click() 

    //Asserts
    cy.get('.toast').then(($toast) => {
      if($toast.text().includes('Credenciais inválidas.')) {  
        cy.verificarMensagensNoToast('Credenciais inválidas.')    
      } else {
        cy.verificarMensagensNoToast('Usuário bloqueado.')
      }
    })
  })

  it('Após 3 tentativas de senhas erradas, deve bloquear o usuário ', () => {
    //Act   
    cy.preencheUsuario('usuario1', 'senhaerrada1')
    for(let i=0; i<3; i++){
      cy.contains('.btn', 'Entrar').click()       
      cy.wait(1000)
    }   

    //Asserts  
    cy.verificarMensagensNoToast('Usuário bloqueado')      

    //After     
    cy.recuperarSenha('usuario1@empresa.com', 'teste123', '01/01/1990') 
  })


  it('Após bloquear o usuário deve permitir o desbloqueio ', () => {
    //Act   
    cy.cadastraUsuarioApi().then((response) => {     
      
      cy.visit('/#/login')     
      const usuario = response.username
      cy.preencheUsuario(usuario, 'senha1')
      for(let i=0; i<3; i++){
        cy.contains('.btn', 'Entrar').click()       
        cy.wait(1000)
      } 
      cy.verificarMensagensNoToast('Usuário bloqueado')  
      cy.desbloquearUsuario(response.userId)
      //After 
      cy.visit('/')  
      cy.preencheUsuario(usuario, 'teste123')
      cy.contains('.btn', 'Entrar').click() 
      cy.contains('h4', 'Painel do Usuário').should('be.visible')
    })  
    
  })

  it('Recuperar senha', () => {
    //Arrange
   cy.cadastraUsuarioRandom().then(uuid => {
    
    //Act 
    const usuario = `teste` + uuid + `@empresa.com`     
    cy.recuperarSenha(usuario, 'Senha123', '21/10/1990')
    })            

    //Assert
    cy.verificarMensagensNoToast('Senha redefinida com sucesso.')       
  })

})